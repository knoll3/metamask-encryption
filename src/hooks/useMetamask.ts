import { useEffect, useState } from "react";

export function useMetamask() {
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!(window as any).ethereum) {
      alert("Metamask required");
    }
  }, []);

  useEffect(() => {
    (async () => {
      const [address] = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      if (address) {
        setAddress(address);
      }
    })();
  }, []);

  return { address };
}
