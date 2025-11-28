<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'address' => $this->address,
            'company_name' => $this->company_name,
            'company_website' => $this->company_website,
            'type' => $this->type,
            'status' => $this->status,
            'referral_code' => $this->referral_code,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at->toISOString(),
            
            // Relationships
            'referrer' => $this->whenLoaded('referrer', function () {
                return [
                    'id' => $this->referrer->id,
                    'name' => $this->referrer->name,
                ];
            }),
            'orders_count' => $this->when(isset($this->orders_count), $this->orders_count),
        ];
    }
}
