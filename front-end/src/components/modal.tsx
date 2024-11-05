import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { toggleModal } from "../store/modal";
import { setApiKey } from "../store/apiKey";

export const Modal = () => {
  const ModalState = useSelector((state: RootState) => state.modal.isModal);
  const apiKey = useSelector<RootState, string[]>((state) => state.apiKeys.apiKey);

  const dispatch = useDispatch();

  const openModalHandler = () => {
    dispatch(toggleModal());
  };

  return (
    <>
      {ModalState ? (
        <div onClick={openModalHandler} className="z-10 fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 transition-all">
          <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center bg-light dark:bg-ctdark rounded-md p-8 w-[500px]  gap-2">
            {/*API KEY 입력 5칸 */}
            {apiKey.map((key: string, i: number) => {
              return (
                <input
                  className="bg-light dark:bg-ctdark dark:border-ctdark border-bddark border border-solid rounded-md  p-2 w-full"
                  key={i}
                  type="text"
                  onChange={(e) => {
                    let copy = [...apiKey];
                    copy[i] = e.target.value;
                    dispatch(setApiKey(copy));
                  }}
                  value={key}
                  placeholder="API 키"
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
};
