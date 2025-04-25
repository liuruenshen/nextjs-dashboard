'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type ModalProps = React.PropsWithChildren<{}>;

export function Modal({ children }: ModalProps) {
  const elementRef = useRef<HTMLDialogElement>(null);
  const route = useRouter();

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    elementRef.current.showModal();

    return () => {
      console.log('Modal unmounted');
    };
  }, []);

  return createPortal(
    <dialog
      ref={elementRef}
      className="rounded-lg p-3 shadow-lg"
      onClose={() => {
        route.back();
      }}
    >
      {children}
    </dialog>,
    document.getElementById('modal-root') ?? document.body,
  );
}
