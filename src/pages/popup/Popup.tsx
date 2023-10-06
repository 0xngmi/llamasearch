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
    <div className="w-full mx-auto max-w-xl mt-[8%] py-4 px-8 gap-6 flex-col flex dark:bg-slate-800">
      <h1 className="mx-auto">
        <a href="https://defillama.com/" target="_blank" rel="noopener noreferrer">
          <img src={cute} alt="Cute Llama" className="w-14 h-14 mx-auto" />
        </a>
        <span className="text-2xl font-bold dark:text-white">LlamaSearch</span>
      </h1>

      <Combobox
        name="search"
        defaultValue={""}
        onChange={(url) => {
          if(url.startsWith("search:")){
            chrome.search.query({
              text: url.slice("search:".length)
            }, ()=>{})
          } else {
            window.open(url, "_self").focus();
          }
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
                    className={({ active }) =>
                      `flex justify-between block cursor-pointer select-none py-2 px-4 ${
                        active ? "bg-blue-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={item.url}
                  >
                    <a href={item.url} target="_self" rel="noopener noreferrer">
                      {item.text}
                    </a>
                    <div className="">{item.type}</div>
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
            className="py-2 px-4 bg-blue-100 hover:bg-blue-200 mx-auto text-black w-fit text-base font-medium rounded-md"
          >
            Display your most used sites
          </button>
        )}

        {displayTopSites && (
          <>
            <h2 className="text-xl font-semibold text-center flex items-center gap-4 justify-center dark:text-white">
              <span>Your most visited sites</span>
              <button
                className="py-1 px-3 bg-gray-100 hover:bg-gray-200 text-black text-base font-medium rounded-md dark:bg-slate-900 dark:text-white dark:hover:bg-slate-700"
                onClick={() => {
                  chrome.permissions.remove(
                    {
                      permissions: ["topSites"],
                    },
                    (removed) => {
                      if (removed) {
                        // This should always be true, but if something goes wrong we just don't change stuff so user can retry again
                        setDisplayTopSites(undefined);
                      }
                    },
                  );
                }}
              >
                <span className="sr-only">Hide</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path
                    fillRule="evenodd"
                    d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z"
                    clipRule="evenodd"
                  />
                  <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                </svg>
              </button>
            </h2>

            <ul className="flex gap-2 flex-wrap mx-auto justify-center">
              {displayTopSites.slice(0,10).map((o) => (
                <li key={"top-sites" + o.url} className="rounded-md hover:bg-gray-100 p-2 dark:hover:bg-slate-600">
                  <a
                    href={o.url}
                    className="text-xs flex flex-col gap-2 w-[80px] justify-between p-2"
                    rel="noopener noreferrer"
                  >
                    <span className="mx-auto p-2 bg-gray-200 rounded-md">
                      <img
                        src={`https://www.google.com/s2/favicons?domain_url=${o.url}&sz=64`}
                        className="mx-auto object-contain w-10 h-10"
                      />
                    </span>
                    <span className="text-ellipsis overflow-hidden whitespace-nowrap text-center dark:text-white">{o.title}</span>
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
