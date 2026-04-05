<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $properties = $this->properties?->toArray() ?? [];

        return [
            'id' => $this->id,
            'module' => $this->log_name,
            'log_name' => $this->log_name,
            'summary' => $this->description,
            'description' => $this->description,
            'action' => $this->event,
            'event' => $this->event,
            'causer_id' => $this->causer_id,
            'causer_name' => $this->causer?->name,
            'entity_type' => class_basename((string) $this->subject_type),
            'subject_type' => class_basename((string) $this->subject_type),
            'subject_id' => $this->subject_id,
            'entity_identifier' => $this->subject_id ? class_basename((string) $this->subject_type).' #'.$this->subject_id : class_basename((string) $this->subject_type),
            'properties' => $properties,
            'ip_address' => data_get($properties, 'ip_address'),
            'user_agent' => data_get($properties, 'user_agent'),
            'changes' => data_get($properties, 'attributes'),
            'previous' => data_get($properties, 'old'),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
