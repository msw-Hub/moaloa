import { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const Modal = ({ children, isOpen, onClose }: ModalProps) => {
  return (
    <>
      {isOpen ? (
        <div onMouseDown={onClose} className="z-10 fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 transition-all">
          <div onMouseDown={(e) => e.stopPropagation()} className="shadow-2xl">
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
};
