import {ReactNode, useState} from "react";
import {Form} from "@heroui/form";
import {Button} from "@heroui/button";
import {JobPeriod} from "@shared-types/JobPeriod";
import PeriodSelect, {PeriodSelectProps} from "../PeriodSelect";

export interface PeriodSelectorFormProps extends PeriodSelectProps {
  onSubmit?: (id: JobPeriod["id"]) => void;
  onEditClick?: (id: JobPeriod["id"]) => void;
  submitLabel?: string;
  renderActions?: (ctx: { selectedId?: string; submit: () => void; edit: () => void }) => ReactNode;
  disableSubmitWhen?: (selectedId?: string, initialId?: string) => boolean;
  initialId?: string;
}

export default function PeriodSelectorForm({
  data,
  value,
  defaultValue,
  onChange,
  onSubmit,
  onEditClick,
  submitLabel = "Select",
  renderActions,
  disableSubmitWhen,
  initialId,
  ...rest
}: PeriodSelectorFormProps) {
  const [selectedId, setSelectedId] = useState<string | null>(value ?? defaultValue ?? (data && data[0]?.id));
  const current = value ?? selectedId ?? "";

  const handleChange = (id: string) => {
    if (value === undefined) setSelectedId(id);
    onChange?.(id);
  };

  const submit = () => current && onSubmit?.(current);
  const edit = () => current && onEditClick?.(current);
  const disable = disableSubmitWhen ? disableSubmitWhen(current, initialId) : !current;

  return (
    <Form className="flex w-full flex-wrap md:flex-nowrap mb-7 gap-4 rounded-2xl" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <PeriodSelect data={data} value={value ?? current} defaultValue={defaultValue} onChange={handleChange} {...rest} />
      <div className="flex gap-2">
        {renderActions ? (
          renderActions({ selectedId: current, submit, edit })
        ) : (
          <>
            <Button color="warning" type="submit" isDisabled={disable}>{submitLabel}</Button>
            <Button color="default" onPress={edit} isDisabled={!current}>Edit</Button>
          </>
        )}
      </div>
    </Form>
  );
}
