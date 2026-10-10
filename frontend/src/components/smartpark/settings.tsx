import { useState } from "react";
import { Save, Info, Building2, UserRound, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParking } from "@/features/parking/store";
import { vehicleTypes } from "@/features/parking/models";
import { PageHeading, Field } from "./common";
export function ParkingSettings() {
  const {
    state: { data },
    execute,
  } = useParking();
  const [lotName, setLotName] = useState(data.settings.lotName);
  const [adminName, setAdminName] = useState(data.settings.adminName);
  const [adminEmail, setAdminEmail] = useState(data.settings.adminEmail);
  const [types, setTypes] = useState(data.settings.supportedTypes);
  const [zones, setZones] = useState([...new Set(data.slots.map((s) => s.zone))].join(", "));
  const [capacity, setCapacity] = useState(
    Math.max(
      ...[...new Set(data.slots.map((s) => s.zone))].map(
        (z) => data.slots.filter((s) => s.zone === z).length,
      ),
    ),
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        execute({
          kind: "settings",
          settings: { lotName, adminName, adminEmail, supportedTypes: types },
          zones: zones
            .split(",")
            .map((z) => z.trim().toUpperCase())
            .filter(Boolean),
          slotsPerZone: capacity,
        });
      }}
    >
      <PageHeading
        title="Settings"
        subtitle="Configure your parking workspace and administrator profile."
      >
        <Button type="submit">
          <Save />
          Save Changes
        </Button>
      </PageHeading>
      <div className="notice mb-6">
        <Info />
        Demo-only settings. Changes are saved in this browser and do not modify your Java project.
      </div>
      <div className="settings-grid">
        <section className="panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Building2 size={17} className="text-primary" />
              <h2>Parking Lot</h2>
            </div>
          </div>
          <div className="settings-body">
            <Field label="Parking lot name">
              <input
                required
                className="control"
                value={lotName}
                onChange={(e) => setLotName(e.target.value)}
              />
            </Field>
            <Field label="Zones (comma-separated)">
              <input
                required
                className="control"
                value={zones}
                onChange={(e) => setZones(e.target.value)}
                placeholder="A, B, C"
              />
            </Field>
            <Field label="Slots per zone">
              <input
                required
                className="control"
                type="number"
                min="1"
                max="50"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </Field>
            <p className="text-[11px] text-muted-foreground leading-5">
              Only available slots can be removed. Existing slot assignments and vehicle
              compatibility are preserved. New slots use the supported vehicle types below.
            </p>
            <fieldset>
              <legend className="text-xs font-semibold mb-3">Supported vehicle types</legend>
              <div className="grid grid-cols-2 gap-3">
                {vehicleTypes.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-primary h-4 w-4"
                      checked={types.includes(t)}
                      onChange={(e) =>
                        setTypes(e.target.checked ? [...types, t] : types.filter((x) => x !== t))
                      }
                    />
                    {t}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>
        <section className="panel h-fit">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <UserRound size={17} className="text-primary" />
              <h2>Administrator Profile</h2>
            </div>
          </div>
          <div className="settings-body">
            <div className="flex items-center gap-3">
              <span className="avatar !w-12 !h-12 !text-base">
                {adminName.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <strong className="text-sm">{adminName || "Administrator"}</strong>
                <p className="text-xs text-muted-foreground mt-1">
                  Demo administrator · No authentication
                </p>
              </div>
            </div>
            <Field label="Full name">
              <input
                className="control"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
            </Field>
            <Field label="Email address">
              <input
                className="control"
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </Field>
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold">Workspace</p>
              <p className="text-xs text-muted-foreground mt-2">{data.settings.lotName}</p>
              <p className="text-[11px] text-muted-foreground mt-2">
                {data.slots.length} slots across {new Set(data.slots.map((s) => s.zone)).size} zones
              </p>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
