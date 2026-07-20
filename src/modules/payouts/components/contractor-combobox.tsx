"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { ChevronDown, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getContractorProfiles } from "@/modules/invoices/data";
import { cn, getInitials } from "@/lib/utils";

const FIELD_CLS =
  "flex w-full items-center gap-3 rounded-xl border bg-background px-4 text-left transition-colors outline-none";

/**
 * Substring matching, replacing cmdk's default fuzzy scorer.
 *
 * The default matches subsequences, so "des" pulls in "**D**aniel Kim mobil**e**
 * developer **S**outh Korea" alongside the actual designers. Fuzzy is fine for
 * a command palette, where a wrong hit costs a keystroke; on a form that picks
 * who receives money, an unrelated name in the list is a hazard. Each word in
 * the query must appear literally, so "des" finds designers and "priya india"
 * narrows across fields.
 */
function matchContractor(haystack: string, query: string) {
  const target = haystack.toLowerCase();
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return words.every((word) => target.includes(word)) ? 1 : 0;
}

/**
 * Searchable contractor picker. A Select can't filter, and the roster is long
 * enough (16 and growing with the ledger) that scanning beats scrolling — so
 * this is a Command in a Popover, matching the palette's search-and-pick
 * vocabulary rather than inventing a second one.
 *
 * The field is one control or two depending on state, because the trigger only
 * earns its place once it has something to summarize:
 *
 * - **Nothing selected** — the field *is* the search input. Typing filters
 *   immediately. A separate trigger here would just be a second box with the
 *   same placeholder as the one in the popover: visible duplication.
 * - **Someone selected** — the field becomes their identity block (avatar,
 *   role, country) and the popover carries its own search. "Who am I paying"
 *   stays legible while browsing alternatives, which matters on a form whose
 *   next fields are an amount and a Send button.
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
  const [query, setQuery] = React.useState("");
  const contractors = React.useMemo(() => getContractorProfiles(), []);
  const selected = contractors.find((contractor) => contractor.name === value);

  // cmdk assigns the input its own id, clobbering anything passed in, so the
  // caller's id is re-applied after cmdk has rendered — otherwise <Label
  // htmlFor> points at nothing, the label doesn't focus the field, and screen
  // readers announce it unlabeled. The layout effect runs before paint, and
  // `query` is a dep because cmdk re-renders the input as you type.
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useLayoutEffect(() => {
    if (id && inputRef.current && inputRef.current.id !== id) inputRef.current.id = id;
  }, [id, selected, query, open]);

  // Dismissal for the unselected state's inline list, which has no Popover to
  // do it. pointerdown (not blur) so clicking a row still commits the choice.
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (selected || !open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, selected]);

  function handleSelect(name: string) {
    onSelect(name);
    setQuery("");
    setOpen(false);
  }

  const list = (
    // max-h lands on a row boundary (4.5 rows of 62px + padding) so the cut
    // falls mid-row on purpose: a half-visible row reads as "more below",
    // where a clean edge reads as the end of the list.
    <CommandList className="max-h-[302px] scroll-py-1.5 px-1.5 pb-1.5">
      <CommandEmpty className="text-muted-foreground">No contractors found.</CommandEmpty>
      {contractors.map((contractor) => (
        <CommandItem
          key={contractor.name}
          // Searchable by role and country too — "designer" and "India" are as
          // likely a starting point as a name.
          value={`${contractor.name} ${contractor.title} ${contractor.country}`}
          data-checked={contractor.name === value}
          // Rows sit one step inside the container's radius (xl → lg), the
          // usual nested-corner relationship; the palette's 2xl is tuned for
          // its own 4xl shell and reads bulbous at this size.
          className="rounded-lg"
          onSelect={() => handleSelect(contractor.name)}
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
  );

  // Width tracks the anchor so the list lines up with the field it extends, and
  // the radius matches it. Command brings its own rounded-4xl/padding, so both
  // are overridden to leave a single seam.
  const contentCls = "w-(--radix-popover-trigger-width) rounded-xl p-0";

  if (!selected) {
    return (
      // No Popover in this state, deliberately. The caret has to stay in the
      // field for typing to filter and arrows to move the highlight, and
      // Radix's content focus guard fights that: it pulls focus to the content
      // div on open, where keystrokes vanish and Enter commits whatever cmdk
      // highlighted first — a wrong-payee bug, not a cosmetic one.
      // onOpenAutoFocus doesn't help (it isn't called for anchor-driven opens).
      // The list needs no portal or focus trap, so it's positioned inline and
      // Command keeps ownership of the keyboard throughout.
      <Command
        ref={rootRef}
        className="relative overflow-visible rounded-xl p-0"
        filter={matchContractor}
        // Escape closes the list without clearing what's typed.
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.preventDefault();
            setOpen(false);
          }
        }}
      >
        <div
          className={cn(
            FIELD_CLS,
            "h-[62px] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30"
          )}
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          {/* The cmdk primitive rather than CommandInput: that wrapper renders
              its own bordered InputGroup and search icon, which inside this
              already-bordered field would be a box in a box, icon twice. */}
          <CommandPrimitive.Input
            ref={inputRef}
            className="h-full flex-1 bg-transparent text-sm outline-hidden placeholder:text-muted-foreground"
            placeholder="Search contractors…"
            value={query}
            onValueChange={(next) => {
              setQuery(next);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            // Closing on blur would fire before a row's click lands; the
            // outside-pointerdown listener below handles dismissal instead.
            aria-expanded={open}
            aria-controls="contractor-list"
          />
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </div>
        {open && (
          <div
            id="contractor-list"
            // Matches the popover surface the selected state uses, so both
            // states read as the same component.
            className="absolute inset-x-0 top-full z-50 mt-1.5 rounded-xl bg-popover shadow-lg ring-1 ring-foreground/5 dark:ring-foreground/10"
            // cmdk's list carries tabindex="-1", so a click that lands on it
            // (including the one synthesized by clicking the field's <label>)
            // pulls focus off the input — keystrokes then go nowhere and Enter
            // commits the first highlighted row. Bounce focus back to the field
            // so the caret always stays where typing is expected.
            onFocus={(event) => {
              if (event.target !== inputRef.current) inputRef.current?.focus();
            }}
          >
            {list}
          </div>
        )}
      </Command>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-label={`Contractor: ${selected.name}. Change contractor`}
        className={cn(
          FIELD_CLS,
          "cursor-pointer justify-between py-3 hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        )}
      >
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
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className={contentCls}>
        <Command className="rounded-xl p-0">
          {/* Search echoes the trigger's radius one step in (lg), not the
              palette's pill — it belongs to the surface it drops out of. */}
          <div className="p-1.5 [&_[data-slot=input-group]]:rounded-lg">
            <CommandInput placeholder="Search contractors…" />
          </div>
          {list}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
