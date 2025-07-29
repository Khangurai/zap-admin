import React, { useEffect, useRef } from "react";

const PlaceAutocomplete = ({ placeholder, onPlaceSelected }) => {
  const inputRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(
          inputRef.current,
          { fields: ["geometry", "name", "formatted_address"] }
        );
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          onPlaceSelected?.(place);
        });
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return <input ref={inputRef} placeholder={placeholder} style={{ width: "100%", padding: "6px" }} />;
};

export default PlaceAutocomplete;
