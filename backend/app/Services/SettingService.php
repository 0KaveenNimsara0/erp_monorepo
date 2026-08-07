<?php

namespace App\Services;

use App\DTOs\Setting\UpdateTaxDTO;
use App\Exceptions\ForbiddenException;
use App\Libraries\AuditLogger;
use App\Repositories\SettingRepository;
use CodeIgniter\HTTP\RequestInterface;

class SettingService
{
    private SettingRepository $settingRepo;

    public function __construct()
    {
        $this->settingRepo = new SettingRepository();
    }

    /**
     * @return array<string, mixed>
     * @throws ForbiddenException
     */
    public function getTaxSettings(object $currentUser): array
    {
        return [
            'enabled' => (bool)$this->settingRepo->getValue('tax_enabled'),
            'rate'    => (float)($this->settingRepo->getValue('tax_rate') ?? 8.0),
        ];
    }

    /**
     * @throws ForbiddenException
     */
    public function updateTaxSettings(array $rawData, object $currentUser, RequestInterface $request): void
    {
        if ($currentUser->role !== 'admin') {
            throw new ForbiddenException('Settings access is restricted to Administrators.');
        }

        $dto = UpdateTaxDTO::fromArray($rawData);

        if ($dto->enabled !== null) {
            $this->settingRepo->setValue('tax_enabled', $dto->enabled ? '1' : '0');
        }

        if ($dto->rate !== null) {
            $this->settingRepo->setValue('tax_rate', (string)$dto->rate);
        }

        AuditLogger::log('UPDATE', 'settings', null, null, ['tax_enabled' => $dto->enabled, 'tax_rate' => $dto->rate], $request, $currentUser->uid);
    }
}
