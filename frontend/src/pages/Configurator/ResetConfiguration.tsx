import { useRef } from 'react';
import { MdRestartAlt } from 'react-icons/md';

export function ResetConfiguration({ onConfirm }: { onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return <>
    <button type="button" onClick={() => dialog.current?.showModal()}><MdRestartAlt /> Скинути</button>
    <dialog className="configurator-dialog" aria-labelledby="configurator-reset-title" ref={dialog}>
      <h2 id="configurator-reset-title">Скинути до базової комплектації?</h2>
      <p>Вибрані зміни буде скинуто, а ціна і вигляд авто повернуться до заводських.</p>
      <form method="dialog" className="configurator-checkout-actions">
        <button value="cancel" autoFocus>Скасувати</button>
        <button value="reset" className="configurator-primary" onClick={onConfirm}>Скинути до базової</button>
      </form>
    </dialog>
  </>;
}
