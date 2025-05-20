import type { JobInsert } from "@/types/JobInsert";
import { extractMeta, stripMeta } from "@utilities/meta";

type FormInput = Record<string, unknown>;

export function toJobInsert(formData: FormInput): JobInsert {
    const base = {
        company: typeof formData.company === "string" ? formData.company : "",
        title: typeof formData.title === "string" ? formData.title : "",
        ...stripMeta(formData),
    };

    const meta = extractMeta(formData);

    return {
        ...base,
        meta,
    };
}
