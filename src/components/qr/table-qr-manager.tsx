"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldLabel } from "@/components/form-label";
import { Input } from "@/components/ui/input";
import { QrCodeCard } from "@/components/qr/qr-code-card";
import { EmptyState } from "@/components/empty-state";
import { createTableQr, deleteTableQr } from "@/lib/actions/qr";
import type { TableQr } from "@/types";

interface TableQrManagerProps {
  restaurantName: string;
  initialTableQrs: TableQr[];
}

export function TableQrManager({
  restaurantName,
  initialTableQrs,
}: TableQrManagerProps) {
  const [tableQrs, setTableQrs] = useState<TableQr[]>(initialTableQrs);
  const [tableName, setTableName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const name = tableName.trim();
    if (!name) return;

    startTransition(async () => {
      const result = await createTableQr(name);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result.tableQr) {
        setTableQrs((prev) => [...prev, result.tableQr!]);
        setTableName("");
        toast.success(`${result.tableQr.table_name} QR created`);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteTableQr(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setTableQrs((prev) => prev.filter((t) => t.id !== id));
        toast.success("Table QR deleted");
      }
    });
  };

  const handleQuickAdd = (name: string) => {
    setError(null);
    startTransition(async () => {
      const result = await createTableQr(name);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result.tableQr) {
        setTableQrs((prev) => [...prev, result.tableQr!]);
        toast.success(`${result.tableQr.table_name} QR created`);
      }
    });
  };

  const existingNames = new Set(tableQrs.map((t) => t.table_name));
  const quickSuggestions = ["Table 1", "Table 2", "Table 3"].filter(
    (s) => !existingNames.has(s)
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-card p-6 shadow-card">
        <h3 className="text-base font-semibold text-foreground">
          Add a Table QR
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Create a unique QR code per table to track where feedback comes from.
        </p>

        <form onSubmit={handleCreate} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <FieldLabel htmlFor="table-qr-name" required>
              Table name
            </FieldLabel>
            <div className="flex flex-wrap gap-3">
          <Input
            id="table-qr-name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="e.g. Table 4, Patio, Bar"
            className="h-11 flex-1 min-w-[200px] rounded-xl border-border"
          />
          <Button
            type="submit"
            disabled={isPending || !tableName.trim()}
            className="h-11 rounded-xl px-5"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Table
          </Button>
            </div>
          </div>
          <FieldError message={error} />
        </form>

        {quickSuggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Quick add:</span>
            {quickSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                disabled={isPending}
                onClick={() => handleQuickAdd(s)}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                + {s}
              </button>
            ))}
          </div>
        )}

      </div>

      {tableQrs.length === 0 ? (
        <EmptyState
          icon={<QrCode className="h-6 w-6" />}
          title="No table QR codes yet"
          description="Add your first table above to generate a unique QR code customers can scan at their seat."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {tableQrs.map((table) => (
            <div key={table.id} className="relative">
              <QrCodeCard
                url={table.qr_url}
                title={table.table_name}
                subtitle={`${restaurantName} · Table QR`}
                filename={`${restaurantName}-${table.table_name}`}
                compact
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                onClick={() => handleDelete(table.id)}
                aria-label={`Delete ${table.table_name}`}
                className="absolute right-4 top-4 text-muted-foreground hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
