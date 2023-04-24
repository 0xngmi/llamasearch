import cute from "@assets/img/memes/cute.gif";
import { useEffect, useState, Fragment } from "react";
import { getSearchOptions } from "./search";
import { Combobox, Transition } from "@headlessui/react";

const Popup = () => {
  const [value, setValue] = useState("");
  const [searchOptions, setSearchOptions] = useState([]);
  const [displayTopSites, setDisplayTopSites] = useState<undefined | any[]>(undefined);

  useEffect(() => {
    chrome.permissions.contains(
      {
        permissions: ["topSites"],
      },
      (result) => {
        if (result) {
          chrome.topSites.get(setDisplayTopSites);
        }
      },
    );
  }, []);

  const handleChange = (event) => {
    setValue(event.target.value);
    getSearchOptions(event.target.value).then(setSearchOptions);
  };

  return (
    <div className="w-full mx-auto max-w-xl mt-[8%] py-4 px-8 gap-6 flex-col flex">
      <h1 className="mx-auto">
        <a href="https://defillama.com/" target="_blank" rel="noopener noreferrer">
          <img src={cute} alt="Cute Llama" className="w-14 h-14 mx-auto" />
        </a>
        <span className="text-2xl font-bold ">LlamaSearch</span>
      </h1>

      <Combobox
        name="search"
        defaultValue={""}
        onChange={(url) => {
          window.open(url, "_blank").focus();
        }}
      >
        <div className="relative mt-1">
          <Combobox.Input
            className="w-full py-2 px-4 text-base text-black rounded-md focus:ring-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600 border"
            displayValue={() => value}
            onChange={handleChange}
            placeholder="Search..."
          />

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setValue("")}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {searchOptions.length === 0 && value !== "" ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">Nothing found.</div>
              ) : (
                searchOptions.map((item) => (
                  <Combobox.Option
                    key={item.url}
                    className={({ active }) =>
                      `relative block cursor-pointer select-none py-2 px-4 ${
                        active ? "bg-blue-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={item.url}
                  >
                    <a href={item.url} target="_self" rel="noopener noreferrer">
                      {item.text}
                    </a>
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>

      <div className="flex flex-col gap-2">
        {!displayTopSites && (
          <button
            onClick={() => {
              chrome.permissions.request(
                {
                  permissions: ["topSites"],
                },
                (granted) => {
                  // The callback argument will be true if the user granted the permissions.
                  if (granted) {
                    chrome.topSites.get(setDisplayTopSites);
                  }
                },
              );
            }}
            className="py-2 px-4 bg-blue-100 hover:bg-blue-200 mx-auto text-black w-fit text-base font-medium rounded-lg"
          >
            Display top used sites
          </button>
        )}

        {displayTopSites && (
          <>
            <h2 className="text-xl font-semibold text-center">Top most visited sites</h2>

            <ul className="flex flex-col gap-2">
              {displayTopSites.map((o) => (
                <li key={o.url} className="text-center">
                  <a href={o.url} className="text-base text-center underline" rel="noopener noreferrer">
                    {o.title}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default Popup;
