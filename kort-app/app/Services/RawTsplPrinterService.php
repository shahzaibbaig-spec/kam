<?php

namespace App\Services;

use RuntimeException;
use Symfony\Component\Process\Process;

class RawTsplPrinterService
{
    public function print(string $payload, ?string $printerSharePath): void
    {
        $normalizedPayload = $this->normalizePayload($payload);

        if ($normalizedPayload === '') {
            throw new RuntimeException('No TSPL payload was generated for this label.');
        }

        if (! $this->isWindowsHost()) {
            throw new RuntimeException('Direct thermal printing is currently supported only on Windows hosts.');
        }

        $target = $this->normalizePrinterSharePath($printerSharePath);

        $jobDirectory = storage_path('app/print-jobs');
        if (! is_dir($jobDirectory) && ! mkdir($jobDirectory, 0775, true) && ! is_dir($jobDirectory)) {
            throw new RuntimeException('Unable to prepare the print job directory.');
        }

        $jobFile = $jobDirectory.DIRECTORY_SEPARATOR.'asset-label-'.now()->format('YmdHisv').'-'.bin2hex(random_bytes(4)).'.tspl';

        $bytes = @file_put_contents($jobFile, $normalizedPayload);
        if ($bytes === false) {
            throw new RuntimeException('Unable to write the TSPL payload to a temporary print job file.');
        }

        try {
            // First try native PHP copy to UNC printer path.
            if (@copy($jobFile, $target)) {
                return;
            }

            // Fallback to Windows copy /b, commonly used for raw TSPL/ZPL dispatch.
            $process = new Process(['cmd', '/c', 'copy', '/b', $jobFile, $target]);
            $process->setTimeout(20);
            $process->run();

            if (! $process->isSuccessful()) {
                $output = trim($process->getErrorOutput().' '.$process->getOutput());
                throw new RuntimeException($output !== '' ? $output : 'Windows print spooler rejected the print job.');
            }
        } finally {
            @unlink($jobFile);
        }
    }

    public function normalizePrinterSharePath(?string $printerSharePath): string
    {
        $value = trim((string) $printerSharePath);

        if ($value === '') {
            throw new RuntimeException('Printer share path is not configured. Set it in Settings > Labels.');
        }

        $value = str_replace('/', '\\', $value);
        $value = ltrim($value, '\\');

        $segments = array_values(array_filter(explode('\\', $value), static fn (string $part): bool => $part !== ''));
        if (count($segments) < 2) {
            throw new RuntimeException('Printer share path must use UNC format, for example \\\\localhost\\TSC.');
        }

        return '\\\\'.$segments[0].'\\'.$segments[1];
    }

    protected function normalizePayload(string $payload): string
    {
        $trimmed = trim($payload);
        if ($trimmed === '') {
            return '';
        }

        $normalized = preg_replace("/\r\n|\r|\n/", "\r\n", $trimmed) ?? $trimmed;

        return $normalized."\r\n";
    }

    protected function isWindowsHost(): bool
    {
        return DIRECTORY_SEPARATOR === '\\';
    }
}
