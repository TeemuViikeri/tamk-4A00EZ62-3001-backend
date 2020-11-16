import "./App.css";
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";

const url = "http://localhost:8080/locations/";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      locations: [],
    };
  }

  componentDidMount() {
    axios.get(url).then((response) => {
      this.setState({ locations: response.data });
    });
    document.getElementById("container").style.cursor = "default";
  }

  render() {
    return (
      <MapContainer
        id="container"
        center={[51.505, -0.09]}
        zoom={2}
        whenCreated={(map) => {
          map.doubleClickZoom.disable();
          map.on("dblclick", async (e) => {
            const l = e.latlng;
            const res = await axios.post(url, {
              latitude: l.lat,
              longitude: l.lng,
            });

            axios.get(url).then((response) => {
              this.setState({ locations: response.data });
            });
          });
        }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
        {this.state.locations.map((location, index) => {
          return (
            <Marker
              key={index}
              position={[location.latitude, location.longitude]}
            ></Marker>
          );
        })}
      </MapContainer>
    );
  }
}

export default App;
