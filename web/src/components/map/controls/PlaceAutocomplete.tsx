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
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const inputRef = useRef<InputRef>(null);
  const places = useMapsLibrary("places");
  const geocoding = useMapsLibrary("geocoding");

  useEffect(() => {
    if (place) {
      setInputValue(place.name || place.formatted_address || "");
    } else {
      setInputValue("");
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
    if (!geocoding) return;
    setGeocoder(new geocoding.Geocoder());
  }, [geocoding]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    const placeChangedListener = placeAutocomplete.addListener(
      "place_changed",
      () => {
        const selectedPlace = placeAutocomplete.getPlace();
        onPlaceSelect(selectedPlace);
        setInputValue(
          selectedPlace.name || selectedPlace.formatted_address || ""
        );
      }
    );

    return () => {
      if (placeChangedListener) {
        placeChangedListener.remove();
      }
    };
  }, [onPlaceSelect, placeAutocomplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value === "") {
      onPlaceSelect(null);
      return;
    }

    const latLngRegex = /^\s*(-?\d{1,3}(\.\d+)?)\s*,\s*(-?\d{1,3}(\.\d+)?)\s*$/;

    if (geocoder && latLngRegex.test(value)) {
      const [lat, lng] = value.split(",").map(parseFloat);
      const latlng = { lat, lng };

      geocoder
        .geocode({ location: latlng })
        .then(({ results }) => {
          if (results && results[0]) {
            const placeResult: google.maps.places.PlaceResult = {
              formatted_address: results[0].formatted_address,
              geometry: results[0].geometry,
              place_id: results[0].place_id,
              name: results[0].formatted_address.split(",")[0],
            };
            onPlaceSelect(placeResult);
            setInputValue(
              placeResult.name || placeResult.formatted_address || ""
            );
          } else {
            onPlaceSelect(null);
          }
        })
        .catch(() => {
          onPlaceSelect(null);
        });
    }
  };

  return (
    <Input
      ref={inputRef}
      value={inputValue}
      allowClear
      placeholder={placeholder}
      prefix={<MapPin size={14} style={{ color: "#999" }} />}
      onChange={handleInputChange}
      style={{
        width: "100%",
        height: "40px",
      }}
    />
  );
};

export default PlaceAutocomplete;