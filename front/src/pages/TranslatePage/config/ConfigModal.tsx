import { ModalPortal } from "../../../utils/helpers/ModalPortal";
import { useEffect, useRef, useState, Fragment } from "react";
import axios from "axios";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { ConfigSuccess } from "./ConfigSuccess";
import { useSetRecoilState } from "recoil";
import { dchannel } from "../../../utils/recoil/atom";

export type ModalProps = {
  onOpenModal: () => void;
};

interface Channel {
  id: string;
  name: string;
}

const ConfigModal = ({ onOpenModal }: ModalProps) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.addEventListener("mousedown", outsideClickHandler);
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("mousedown", outsideClickHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [channels, setChannels] = useState<Channel[]>([]);

  /* select discord channel */
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const setChannel = useSetRecoilState(dchannel);

  useEffect(() => {
    axios
      .get("https://localhost:3002/api/discord-channels")
      .then((response) => {
        console.log(response.data);
        setChannels(response.data);
        setSelectedChannel(response.data[0]);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      console.log(selectedChannel.id);
      setChannel(selectedChannel.id);
    }
  }, [selectedChannel]);

  /* config success */
  const [success, setSuccess] = useState(false);
  const successHandler = () => {
    setSuccess(true);
  };

  /* modal outside click */
  const modalRef = useRef<HTMLDivElement | null>(null);

  const outsideClickHandler = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onOpenModal();
    }
  };

  return (
    <ModalPortal>
      <div className="fixed top-0 left-0 flex items-center justify-center w-full h-screen bg-black bg-opacity-40">
        {success ? (
          <div
            ref={modalRef}
            className="container w-[22rem] h-[18rem] md:w-[42rem] md:h-[28rem] flex flex-col items-center justify-center bg-white rounded-3xl shadow-lg"
          >
            <ConfigSuccess onModalAlert={onOpenModal} />
          </div>
        ) : (
          <div
            ref={modalRef}
            className="container w-[22rem] h-[18rem] md:w-[42rem] md:h-[28rem] flex flex-col items-center justify-center bg-white rounded-3xl shadow-lg"
          >
            <p className="text-2xl font-bold text-black md:text-3xl font-main">
              설정할 플랫폼을 선택해주세요
            </p>
            <div className="flex flex-col items-center justify-center md:mt-6 md:mb-6 md:flex-row">
              {loading ? (
                <div className="w-48 h-12 mt-8 md:mt-10">
                  <p className="py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md sm:text-sm">
                    loading...
                  </p>
                </div>
              ) : (
                <div className="w-48 h-12 mt-8 md:mt-10">
                  <Listbox value={selectedChannel} onChange={setSelectedChannel}>
                    <div className="mt-2">
                      <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-green-300 sm:text-sm">
                        <span className="block truncate">
                          {selectedChannel!.name}
                        </span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <ChevronUpDownIcon
                            className="w-5 h-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute w-48 py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {channels.map((item, itemIdx) => (
                            <Listbox.Option
                              key={itemIdx}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-3 pr-4 ${
                                  active
                                    ? "bg-green-100 text-green-900"
                                    : "text-gray-900"
                                }`
                              }
                              value={item}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? "font-medium" : "font-normal"
                                    }`}
                                  >
                                    {item.name}
                                  </span>
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
              )}
            </div>
            <button
              onClick={successHandler}
              className="w-[250px] h-[46px] mt-10 bg-main-2 font-main font-bold text-white text-xl rounded-xl"
            >
              설정 완료
            </button>
          </div>
        )}
      </div>
    </ModalPortal>
  );
};

export default ConfigModal;
