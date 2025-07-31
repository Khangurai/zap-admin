import { Input } from "antd";
import type { InputRef } from "antd";
import React, { useState, useEffect, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  place: google.maps.places.PlaceResult | null;
  placeholder?: string;
}

const PlaceAutocomplete = ({
  onPlaceSelect,
  place,
  placeholder = "Enter location",
}: PlaceAutocompleteProps) => {
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const inputRef = useRef<InputRef>(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (place) {
      setInputValue(place.name || place.formatted_address || "");
    }
  }, [place]);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ["geometry", "name", "formatted_address", "place_id"],
      types: ["establishment", "geocode"],
      componentRestrictions: { country: "mm" },
    };

    setPlaceAutocomplete(
      new places.Autocomplete(inputRef.current.input!, options)
    );
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener("place_changed", () => {
      const selectedPlace = placeAutocomplete.getPlace();
      onPlaceSelect(selectedPlace);
      setInputValue("");
    });

    return () => {
      if (placeAutocomplete) {
        google.maps.event.clearInstanceListeners(placeAutocomplete);
      }
    };
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <Input
      ref={inputRef}
      value={inputValue}
      allowClear
      placeholder={placeholder}
      prefix={<MapPin size={14} style={{ color: "#999" }} />}
      onChange={(e) => {
        setInputValue(e.target.value);
        if (e.target.value === "") {
          onPlaceSelect(null);
        }
      }}
      style={{
        width: "100%",
        height: "40px",
      }}
    />
  );
};

export default PlaceAutocomplete;