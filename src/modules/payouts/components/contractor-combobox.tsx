"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getContractorProfiles } from "@/modules/invoices/data";
import { cn, getInitials } from "@/lib/utils";

/**
 * Searchable contractor picker. A Select can't filter, and the roster is long
 * enough (16 and growing with the ledger) that scanning beats scrolling —
 * so this is a Command inside a Popover, matching the command palette's
 * search-and-pick vocabulary rather than inventing a second one.
 */
export function ContractorCombobox({
  value,
  onSelect,
  id,
}: {
  value: string;
  onSelect: (name: string) => void;
  id?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const contractors = React.useMemo(() => getContractorProfiles(), []);
  const selected = contractors.find((contractor) => contractor.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-label={selected ? `Contractor: ${selected.name}` : "Select a contractor"}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border bg-background px-4 py-3 text-left transition-colors outline-none",
          "hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        )}
      >
        {selected ? (
          <span className="flex min-w-0 items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback className="text-xs">{getInitials(selected.name)}</AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-sm font-medium">{selected.name}</span>
              <span className="truncate text-sm text-muted-foreground">
                {selected.title} · {selected.country}
              </span>
            </span>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Search contractors…</span>
        )}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      {/* Width tracks the trigger so the list lines up with the field it fills,
          and the radius matches it so the popover reads as an extension of the
          field rather than a second, separate surface. Command brings its own
          rounded-4xl/padding, so both are overridden here to a single seam. */}
      <PopoverContent align="start" sideOffset={6} className="w-(--radix-popover-trigger-width) rounded-xl p-0">
        <Command className="rounded-xl p-0">
          {/* The search field echoes the trigger's radius (xl), not the
              palette's pill — matching the surface it drops out of. */}
          <div className="p-1.5 [&_[data-slot=input-group]]:rounded-lg">
            <CommandInput placeholder="Search contractors…" />
          </div>
          <CommandList className="px-1.5 pb-1.5">
            <CommandEmpty className="text-muted-foreground">No contractors found.</CommandEmpty>
            {contractors.map((contractor) => (
              <CommandItem
                key={contractor.name}
                // Searchable by role and country too — "designer" and "India"
                // are as likely a starting point as a name.
                value={`${contractor.name} ${contractor.title} ${contractor.country}`}
                data-checked={contractor.name === value}
                // Rows sit one step inside the container's radius (xl → lg),
                // the usual nested-corner relationship; the palette's 2xl is
                // tuned for its own 4xl shell and reads bulbous at this size.
                className="rounded-lg"
                onSelect={() => {
                  onSelect(contractor.name);
                  setOpen(false);
                }}
              >
                <Avatar className="size-9">
                  <AvatarFallback className="text-xs">{getInitials(contractor.name)}</AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-medium">{contractor.name}</span>
                  <span className="truncate text-sm font-normal text-muted-foreground">
                    {contractor.title} · {contractor.country}
                  </span>
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
