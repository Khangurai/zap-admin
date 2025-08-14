import requests
import json

# သင့် API Key (Google Cloud ကနေရရှိမည်)
API_KEY = "YOUR_API_KEY_HERE"

# Fleet Routing API Endpoint
url = "https://fleetengine.googleapis.com/v1:optimizeTours"

# Request Body
payload = {
    "vehicles": [
        {
            "name": "5/345-U Aung",
            "startWaypoint": {
                "location": {
                    "latLng": {
                        "latitude": 16.776474,
                        "longitude": 96.171004
                    }
                }
            },
            "endWaypoint": {
                "location": {
                    "latLng": {
                        "latitude": 16.803815,
                        "longitude": 96.12437
                    }
                }
            },
            "availableTimeWindows": [
                {
                    "startTime": "2025-08-10T07:00:00Z",
                    "endTime": "2025-08-10T09:00:00Z"
                }
            ],
            "capacity": ["15"],
            "costPerHour": 60,
            "costPerKilometer": 5
        }
    ],
    "shipments": [
        {
            "label": "TEAM432,Kyaw Thaung",
            "pickups": [
                {
                    "arrivalWaypoint": {
                        "location": {
                            "latLng": {
                                "latitude": 16.77122,
                                "longitude": 96.175772
                            }
                        }
                    },
                    "duration": "300s"
                }
            ],
            "demands": {
                "item_count": {
                    "amount": "1"
                }
            }
        },
        {
            "label": "TEAM820,Zaw Min",
            "pickups": [
                {
                    "arrivalWaypoint": {
                        "location": {
                            "latLng": {
                                "latitude": 16.776539,
                                "longitude": 96.168959
                            }
                        }
                    },
                    "duration": "300s"
                }
            ],
            "demands": {
                "item_count": {
                    "amount": "1"
                }
            }
        },
        {
            "label": "TEAM286,Mya Hnin",
            "pickups": [
                {
                    "arrivalWaypoint": {
                        "location": {
                            "latLng": {
                                "latitude": 16.778781,
                                "longitude": 96.16733
                            }
                        }
                    },
                    "duration": "300s"
                }
            ],
            "demands": {
                "item_count": {
                    "amount": "1"
                }
            }
        },
        {
            "label": "TEAM698,Ko Ko",
            "pickups": [
                {
                    "arrivalWaypoint": {
                        "location": {
                            "latLng": {
                                "latitude": 16.78585,
                                "longitude": 96.161588
                            }
                        }
                    },
                    "duration": "300s"
                }
            ],
            "demands": {
                "item_count": {
                    "amount": "1"
                }
            }
        },
        {
            "label": "TEAM851,Aye Chan",
            "pickups": [
                {
                    "arrivalWaypoint": {
                        "location": {
                            "latLng": {
                                "latitude": 16.786012,
                                "longitude": 96.14788
                            }
                        }
                    },
                    "duration": "300s"
                }
            ],
            "demands": {
                "item_count": {
                    "amount": "1"
                }
            }
        },
        {
            "label": "TEAM344,Soe Win",
            "pickups": [
                {
                    "arrivalWaypoint": {
                        "location": {
                            "latLng": {
                                "latitude": 16.779877,
                                "longitude": 96.13744
                            }
                        }
                    },
                    "duration": "300s"
                }
            ],
            "demands": {
                "item_count": {
                    "amount": "1"
                }
            }
        },
        {
            "label": "TEAM289,Hla Hla",
            "pickups": [
                {
                    "arrivalWaypoint": {
                        "location": {
                            "latLng": {
                                "latitude": 16.780137,
                                "longitude": 96.13744
                            }
                        }
                    },
                    "duration": "300s"
                }
            ],
            "demands": {
                "item_count": {
                    "amount": "1"
                }
            }
        },
        {
            "label": "TEAM570,Thura",
            "pickups": [
                {
                    "arrivalWaypoint": {
                        "location": {
                            "latLng": {
                                "latitude": 16.780642,
                                "longitude": 96.131666
                            }
                        }
                    },
                    "duration": "300s"
                }
            ],
            "demands": {
                "item_count": {
                    "amount": "1"
                }
            }
        },
        {
            "label": "TEAM517,Than Myint",
            "pickups": [
                {
                    "arrivalWaypoint": {
                        "location": {
                            "latLng": {
                                "latitude": 16.793038,
                                "longitude": 96.122994
                            }
                        }
                    },
                    "duration": "300s"
                }
            ],
            "demands": {
                "item_count": {
                    "amount": "1"
                }
            }
        },
        {
            "label": "TEAM363,Moe Moe",
            "pickups": [
                {
                    "arrivalWaypoint": {
                        "location": {
                            "latLng": {
                                "latitude": 16.802123,
                                "longitude": 96.122292
                            }
                        }
                    },
                    "duration": "300s"
                }
            ],
            "demands": {
                "item_count": {
                    "amount": "1"
                }
            }
        },
        {
            "label": "TEAM627,Aung Aung",
            "pickups": [
                {
                    "arrivalWaypoint": {
                        "location": {
                            "latLng": {
                                "latitude": 16.803815,
                                "longitude": 96.12437
                            }
                        }
                    },
                    "duration": "300s"
                }
            ],
            "demands": {
                "item_count": {
                    "amount": "1"
                }
            }
        },
        {
            "label": "TEAM795,Khin Khin",
            "pickups": [
                {
                    "arrivalWaypoint": {
                        "location": {
                            "latLng": {
                                "latitude": 16.803723,
                                "longitude": 96.133336
                            }
                        }
                    },
                    "duration": "300s"
                }
            ],
            "demands": {
                "item_count": {
                    "amount": "1"
                }
            }
        },
        {
            "label": "TEAM544,Nay Lin",
            "pickups": [
                {
                    "arrivalWaypoint": {
                        "location": {
                            "latLng": {
                                "latitude": 16.804693,
                                "longitude": 96.133012
                            }
                        }
                    },
                    "duration": "300s"
                }
            ],
            "demands": {
                "item_count": {
                    "amount": "1"
                }
            }
        },
        {
            "label": "TEAM719,Wai Yan",
            "pickups": [
                {
                    "arrivalWaypoint": {
                        "location": {
                            "latLng": {
                                "latitude": 16.815558,
                                "longitude": 96.128566
                            }
                        }
                    },
                    "duration": "300s"
                }
            ],
            "demands": {
                "item_count": {
                    "amount": "1"
                }
            }
        }
    ],
    "globalStartTime": "2025-08-10T07:00:00Z",
    "globalEndTime": "2025-08-10T09:00:00Z",
    "searchMode": "RETURN_FASTEST",
    "considerRoadTraffic": True,
    "populateTransitionPolylines": True
}

# Headers
headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": API_KEY,
    "X-Goog-FieldMask": (
        "routes.routeLabel,routes.visits,routes.route,routes.routeDuration,"
        "routes.routeDistanceMeters,routes.routePolyline.encodedPolyline"
    )
}

# API ခေါ်ပါ
response = requests.post(url, data=json.dumps(payload), headers=headers)

# အဖြေကို စစ်ပါ
if response.status_code == 200:
    result = response.json()
    print("✅ Route အောင်မြင်စွာတွက်ချက်ပြီးစီးပါသည်။")
    
    # Route ကို print ထုတ်ပါ
    route = result["routes"][0]
    print(f"ကား: {route['routeLabel']}")
    print(f"ခရီးအကွာအဝေး: {route['routeDistanceMeters'] / 1000:.2f} km")
    print(f"ခရီးအချိန်: {route['routeDuration']}")

    print("\n📍 Pickup အစဉ်:")
    for i, visit in enumerate(route["visits"]):
        label = visit["shipmentLabel"]
        duration = visit["visitRequestDuration"]
        print(f"{i+1}. {label} (စောင့်ဆိုင်းချိန်: {duration})")

    # GeoJSON အဖြစ်ထုတ်ပါ
    with open("route_output.geojson", "w", encoding="utf-8") as f:
        polyline = route.get("routePolyline", {}).get("encodedPolyline", "")
        if polyline:
            import polyline  # pip install polyline
            decoded = polyline.decode(polyline)
            coordinates = [[point[1], point[0]] for point in decoded]  # [lng, lat]

            geojson = {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {
                            "vehicle": "5/345-U Aung",
                            "driver": "Aung",
                            "departure": "07:00",
                            "arrival": "09:00"
                        },
                        "geometry": {
                            "type": "LineString",
                            "coordinates": coordinates
                        }
                    }
                ]
            }
            json.dump(geojson, f, ensure_ascii=False, indent=2)
            print("\n✅ GeoJSON ကို route_output.geojson အဖြစ်သိမ်းဆည်းပြီးစီးပါသည်။")
else:
    print("❌ အမှားဖြစ်ပါသည်:", response.status_code)
    print(response.text)