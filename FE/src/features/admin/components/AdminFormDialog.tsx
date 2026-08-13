import {
  useEffect,
  useState,
} from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'

export type FormValue =
  | string
  | number
  | null

export type FormValues =
  Record<string, FormValue>

export interface AdminFormOption {
  value:
    | string
    | number

  label: string
}

export interface AdminFormField {
  name: string
  label: string

  type?:
    | 'text'
    | 'number'
    | 'select'
    | 'multiline'

  required?: boolean

  options?:
    AdminFormOption[]
}

interface Props {
  open: boolean
  title: string

  fields:
    AdminFormField[]

  initial:
    FormValues

  saving?: boolean

  onClose:
    () => void

  onSave:
    (
      values:
        FormValues,
    ) => void
}

export function AdminFormDialog({
  open,
  title,
  fields,
  initial,
  saving = false,
  onClose,
  onSave,
}: Props) {
  const [
    values,
    setValues,
  ] =
    useState<FormValues>(
      initial,
    )

  useEffect(() => {
    if (open) {
      setValues(initial)
    }
  }, [
    open,
    initial,
  ])

  const valid =
    fields.every(
      field => {
        if (!field.required)
          return true

        const value =
          values[
            field.name
          ]

        return (
          value !== null &&
          value !== '' &&
          value !==
            undefined
        )
      },
    )

  return (
    <Dialog
      open={open}
      onClose={
        saving
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle
        sx={{
          fontWeight: 900,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent
        sx={{
          pt:
            '12px !important',

          display:
            'flex',

          flexDirection:
            'column',

          gap: 2,
        }}
      >
        {fields.map(
          field => {
            const value =
              values[
                field.name
              ] ?? ''

            if (
              field.type ===
              'select'
            ) {
              return (
                <FormControl
                  key={
                    field.name
                  }
                  fullWidth
                  required={
                    field.required
                  }
                >
                  <InputLabel>
                    {
                      field.label
                    }
                  </InputLabel>

                  <Select
                    label={
                      field.label
                    }
                    value={
                      value
                    }
                    onChange={
                      event =>
                        setValues(
                          current => ({
                            ...current,

                            [field.name]:
                              event
                                .target
                                .value as FormValue,
                          }),
                        )
                    }
                  >
                    {!field.required && (
                      <MenuItem
                        value=""
                      >
                        Không chọn
                      </MenuItem>
                    )}

                    {(
                      field.options ??
                      []
                    ).map(
                      option => (
                        <MenuItem
                          key={String(
                            option.value,
                          )}
                          value={
                            option.value
                          }
                        >
                          {
                            option.label
                          }
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
              )
            }

            return (
              <TextField
                key={
                  field.name
                }
                label={
                  field.label
                }
                value={
                  value
                }
                type={
                  field.type ===
                  'number'
                    ? 'number'
                    : 'text'
                }
                multiline={
                  field.type ===
                  'multiline'
                }
                minRows={
                  field.type ===
                  'multiline'
                    ? 3
                    : undefined
                }
                required={
                  field.required
                }
                onChange={
                  event =>
                    setValues(
                      current => ({
                        ...current,

                        [field.name]:
                          field.type ===
                          'number'
                            ? event
                                  .target
                                  .value ===
                                ''
                              ? null
                              : Number(
                                  event
                                    .target
                                    .value,
                                )
                            : event
                                .target
                                .value,
                      }),
                    )
                }
                fullWidth
              />
            )
          },
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
        }}
      >
        <Button
          onClick={onClose}
          disabled={saving}
        >
          Hủy
        </Button>

        <Button
          variant="contained"
          disabled={
            !valid ||
            saving
          }
          onClick={() =>
            onSave(values)
          }
        >
          {saving
            ? 'Đang lưu...'
            : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}