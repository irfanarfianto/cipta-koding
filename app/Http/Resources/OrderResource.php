<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_code' => $this->order_code,
            'status' => $this->status,
            'priority' => $this->priority,
            'final_amount' => $this->final_amount,
            'discount_amount' => $this->discount_amount,
            'discount_type' => $this->discount_type,
            'discount_code' => $this->discount_code,
            'notes' => $this->notes,
            'estimated_completion_date' => $this->estimated_completion_date?->format('Y-m-d'),
            
            // Timestamps
            'confirmed_at' => $this->confirmed_at?->toISOString(),
            'started_at' => $this->started_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Relationships
            'client' => new ClientResource($this->whenLoaded('client')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'invoices' => InvoiceResource::collection($this->whenLoaded('invoices')),
            'assigned_to' => $this->whenLoaded('assignedTo', function () {
                return [
                    'id' => $this->assignedTo->id,
                    'name' => $this->assignedTo->name,
                    'email' => $this->assignedTo->email,
                ];
            }),
            
            // Computed fields
            'total_paid' => $this->when($this->relationLoaded('invoices'), fn() => $this->totalPaid()),
            'remaining_to_invoice' => $this->when($this->relationLoaded('invoices'), fn() => $this->remainingToInvoice()),
        ];
    }
}
