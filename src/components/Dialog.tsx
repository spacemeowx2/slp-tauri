import React, { useState, useCallback } from 'react'
import { DefaultButton, PrimaryButton, Dialog, DialogType, DialogFooter } from '@fluentui/react'
import { useLang } from '../lang'

export const useDialog = ({ onOK, title, body, subText, disabled, beforeOpen }: {
  onOK?: () => void | Promise<void>
  beforeOpen?: () => void
  body?: React.ReactNode
  title?: string | React.ReactElement
  subText?: string
  disabled?: boolean
}) => {
  const { t } = useLang()
  const [ hideDialog, setHideDialog ] = useState(true)
  const [ loading, setLoading ] = useState(false)
  const open = useCallback(() => {
    beforeOpen?.()
    setHideDialog(false)
  }, [ beforeOpen ])
  const close = useCallback(() => setHideDialog(true), [])

  return {
    open,
    dialog: <>
      <Dialog
        hidden={hideDialog}
        onDismiss={close}
        dialogContentProps={{
          type: DialogType.normal,
          title,
          closeButtonAriaLabel: 'Close',
          subText,
        }}
        isBlocking={false}
      >
        { body }
        <DialogFooter>
          <PrimaryButton disabled={disabled || loading} onClick={async () => {
            try {
              setLoading(true)
              await onOK?.()
              close()
            } finally {
              setLoading(false)
            }
          }} text={t('ok')} />
          <DefaultButton disabled={loading} onClick={close} text={t('cancel')} />
        </DialogFooter>
      </Dialog>
    </>
  }
}
