import { ArrowRight, ScanSearch } from 'lucide-react';
import { motion } from 'framer-motion';

import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppCard, AppCardContent } from '@/Components/data-display/AppCard';
import { AssetStatusBadge } from '@/Components/domain/shared/AssetStatusBadge';
import { ConditionBadge } from '@/Components/domain/shared/ConditionBadge';
import { AppLink } from '@/Components/ui/AppLink';
import type { AssetListRow } from '@/types/assets';
import { joinDisplayParts } from '@/Lib/utils';

export interface AssetScanResultCardProps {
    asset: AssetListRow;
}

export function AssetScanResultCard({ asset }: AssetScanResultCardProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
            <AppCard className="border-blue-100">
                <AppCardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-primary-soft p-3 text-blue-700">
                                    <ScanSearch className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-slate-950">{asset.asset_name}</p>
                                    <p className="text-sm text-slate-500">{asset.asset_code}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <AssetStatusBadge value={asset.asset_status} />
                                <ConditionBadge value={asset.condition_status} />
                                <AppBadge variant="outline">{asset.tag_number ?? 'No tag generated'}</AppBadge>
                            </div>

                            <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                <p>
                                    Category: <span className="font-medium text-slate-800">{asset.category_name ?? 'Not assigned'}</span>
                                </p>
                                <p>
                                    Assigned to: <span className="font-medium text-slate-800">{asset.assigned_user_name ?? 'Unassigned'}</span>
                                </p>
                                <p className="sm:col-span-2">
                                    Location:{' '}
                                    <span className="font-medium text-slate-800">
                                        {joinDisplayParts([asset.department_name, asset.location_name], ' / ', 'Unassigned')}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <AppLink
                            href={route('assets.show', asset.id)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                            Open record
                            <ArrowRight className="h-4 w-4" />
                        </AppLink>
                    </div>
                </AppCardContent>
            </AppCard>
        </motion.div>
    );
}
