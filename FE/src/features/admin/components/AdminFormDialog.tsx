import {
  useEffect,
  useState,
} from 'react'

import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  disabled?: boolean

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
  error?: string | null

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
  error = null,
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
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

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
              const selectedOption = (field.options ?? []).find(
                o => String(o.value) === String(value),
              ) ?? null

              return (
                <Autocomplete
                  key={field.name}
                  disabled={field.disabled}
                  options={field.options ?? []}
                  getOptionLabel={option => option.label ?? ''}
                  isOptionEqualToValue={(option, val) => String(option.value) === String(val.value)}
                  value={selectedOption}
                  onChange={(_, newValue) => {
                    setValues(current => ({
                      ...current,
                      [field.name]: newValue ? (newValue.value as FormValue) : '',
                    }))
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={field.label}
                      placeholder={`Nhập để tìm/lọc ${field.label.toLowerCase()}...`}
                      required={field.required}
                      fullWidth
                    />
                  )}
                  noOptionsText="Không tìm thấy kết quả"
                  fullWidth
                />
              )
            }

            return (
              <TextField
                key={
                  field.name
                }
                disabled={field.disabled}
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