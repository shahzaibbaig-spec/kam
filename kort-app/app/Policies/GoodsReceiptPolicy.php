<?php

namespace App\Policies;

use App\Models\GoodsReceipt;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class GoodsReceiptPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('goods-receipt.view');
    }

    public function view(User $user, GoodsReceipt $goodsReceipt): bool
    {
        return $user->can('goods-receipt.view');
    }

    public function create(User $user): bool
    {
        return $user->can('goods-receipt.create');
    }

    public function update(User $user, GoodsReceipt $goodsReceipt): bool
    {
        return false;
    }

    public function delete(User $user, GoodsReceipt $goodsReceipt): bool
    {
        return false;
    }

    public function process(User $user, GoodsReceipt $goodsReceipt): bool
    {
        return $user->can('goods-receipt.process');
    }
}
