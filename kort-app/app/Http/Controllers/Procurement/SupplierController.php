<?php

namespace App\Http\Controllers\Procurement;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\SupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use App\Services\ProcurementOptionsService;
use App\Services\SupplierCodeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Supplier::class, 'supplier');
    }

    public function index(Request $request, ProcurementOptionsService $options): Response
    {
        $filters = $request->only(['search', 'supplier_type', 'active', 'city']);

        $suppliers = Supplier::query()
            ->withCount(['purchaseOrders', 'goodsReceipts', 'purchaseRequisitionItems'])
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(fn ($inner) => $inner
                    ->where('supplier_name', 'like', "%{$search}%")
                    ->orWhere('supplier_code', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%"));
            })
            ->when($filters['supplier_type'] ?? null, fn ($query, string $type) => $query->where('supplier_type', $type))
            ->when(isset($filters['active']) && $filters['active'] !== '', fn ($query) => $query->where('is_active', filter_var($filters['active'], FILTER_VALIDATE_BOOLEAN)))
            ->when($filters['city'] ?? null, fn ($query, string $city) => $query->where('city', $city))
            ->orderBy('supplier_name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Procurement/Suppliers/Index', [
            'filters' => $filters,
            'suppliers' => SupplierResource::collection($suppliers),
            'filterOptions' => $options->supplierFilters(),
            'permissions' => [
                'create' => $request->user()?->can('supplier.create') ?? false,
            ],
        ]);
    }

    public function create(ProcurementOptionsService $options): Response
    {
        return Inertia::render('Procurement/Suppliers/Form', [
            'supplier' => null,
            'options' => [
                'types' => $options->supplierTypes(),
            ],
        ]);
    }

    public function store(SupplierRequest $request, SupplierCodeService $codes): RedirectResponse
    {
        $supplier = Supplier::query()->create([
            ...$request->validated(),
            'supplier_code' => $request->validated('supplier_code') ?: $codes->generate(),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        activity('procurement')
            ->performedOn($supplier)
            ->causedBy($request->user())
            ->event('supplier-created')
            ->log('Supplier created');

        return redirect()->route('procurement.suppliers.show', $supplier)->with('success', 'Supplier created successfully.');
    }

    public function show(Supplier $supplier): Response
    {
        $supplier->load([
            'purchaseOrders.supplier',
            'goodsReceipts',
            'purchaseRequisitionItems.purchaseRequisition.department',
        ])->loadCount(['purchaseOrders', 'goodsReceipts', 'purchaseRequisitionItems']);

        return Inertia::render('Procurement/Suppliers/Show', [
            'supplier' => SupplierResource::make($supplier),
            'permissions' => [
                'edit' => request()->user()->can('supplier.edit'),
                'delete' => request()->user()->can('supplier.delete'),
                'createPo' => request()->user()->can('purchase-order.create'),
                'createRequisition' => request()->user()->can('requisition.create'),
            ],
        ]);
    }

    public function edit(Supplier $supplier, ProcurementOptionsService $options): Response
    {
        return Inertia::render('Procurement/Suppliers/Form', [
            'supplier' => SupplierResource::make($supplier),
            'options' => [
                'types' => $options->supplierTypes(),
            ],
        ]);
    }

    public function update(SupplierRequest $request, Supplier $supplier): RedirectResponse
    {
        $supplier->update([
            ...$request->validated(),
            'updated_by' => $request->user()->id,
        ]);

        activity('procurement')
            ->performedOn($supplier)
            ->causedBy($request->user())
            ->event('supplier-updated')
            ->log('Supplier updated');

        return redirect()->route('procurement.suppliers.show', $supplier)->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        if ($supplier->purchaseOrders()->exists() || $supplier->goodsReceipts()->exists()) {
            return back()->with('error', 'Suppliers with procurement history should be deactivated rather than archived.');
        }

        $supplier->delete();

        activity('procurement')
            ->performedOn($supplier)
            ->causedBy(request()->user())
            ->event('supplier-archived')
            ->log('Supplier archived');

        return redirect()->route('procurement.suppliers.index')->with('success', 'Supplier archived successfully.');
    }
}
