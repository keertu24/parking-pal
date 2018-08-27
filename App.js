import axios from "axios";
import _ from "lodash";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import Block from "./components/Block.js";

const parkingEndpoint = "http://localhost:3000/api/parking";

const defaultDimension = 0.02;

const defaultRegion = {
  latitude: 37.7836839,
  longitude: -122.40898609999999,
  latitudeDelta: defaultDimension,
  longitudeDelta: defaultDimension
};

const days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

export default class App extends React.Component {
  constructor(props) {
    super(props);
    const currentTime = new Date("August 22, 2018 9:00");
    this.state = {
      currentTime,
      region: defaultRegion,
      selectedBlock: null,
      parkedBlock: null,
      dayIndexInWeek: currentTime.getDay(),
      dayIndexInMonth: Math.floor(currentTime.getDate() / 7),
      currentHour: currentTime.getHours()
    };
    this.onRegionChange = this.onRegionChange.bind(this);
    this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this);
    this.selectBlock = this.selectBlock.bind(this);
    this.toggleParking = this.toggleParking.bind(this);
  }

  componentDidMount() {
    this.getParkingInfo();
    navigator.geolocation.getCurrentPosition(
      location => this.setState(location),
      err => console.log(err)
    );
  }

  onRegionChange(region) {
    this.setState({
      region
    });
  }

  onRegionChangeComplete() {
    this.getParkingInfo();
  }

  getParkingInfo() {
    const { region } = this.state;
    const viewDimension = Math.min(defaultDimension, region.latitudeDelta);
    axios
      .get(parkingEndpoint, {
        params: {
          llLatitude: region.latitude - 0.5 * viewDimension,
          llLongitude: region.longitude - 0.5 * viewDimension,
          urLatitude: region.latitude + 0.5 * viewDimension,
          urLongitude: region.longitude + 0.5 * viewDimension
        }
      })
      .then(
        results => this.setState({ blocks: results.data }),
        err => console.log(err)
      );
  }

  selectBlock(block) {
    this.setState({ selectedBlock: block });
  }

  toggleParking() {
    console.log("toggling parking");
    const { selectedBlock, parkedBlock } = this.state;
    this.setState(
      {
        parkedBlock: selectedBlock !== parkedBlock ? selectedBlock : null
      },
      () => console.log(parkedBlock)
    );
  }

  getNextSweeping(block) {
    let { currentTime } = this.state;
    let testDate = currentTime;
    testDate.setHours(0, 0, 0, 0);
    while (true) {
      const sweepDay = days[testDate.getDay()] === block.day;
      const sweepWeek = block.weeks[Math.floor(testDate.getDate() / 7)] === "Y";
      if (sweepDay && sweepWeek) {
        nextSweeping = testDate;
        if (
          nextSweeping > currentTime ||
          block.endhour > currentTime.getHours()
        ) {
          testDate.setHours(block.starthour);
          return testDate;
        }
      }
      testDate.setDate(testDate.getDate() + 1);
    }
  }

  render() {
    const {
      blocks,
      selectedBlock,
      parkedBlock,
      dayIndexInWeek,
      dayIndexInMonth,
      currentHour
    } = this.state;
    const addressInfo = selectedBlock
      ? `${selectedBlock.lf_fadd}-${selectedBlock.lf_toadd} ${
          selectedBlock.streetname
        }`
      : null;
    const nextSweeping = selectedBlock
      ? this.getNextSweeping(selectedBlock)
      : null;
    const selectedBlockInfo = `Current selection: ${addressInfo}
      Next sweeping: ${nextSweeping}`;
    return (
      <MapView
        provider={null}
        style={styles.container}
        initialRegion={defaultRegion}
        loadingEnabled={true}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsTraffic={false}
        onRegionChange={this.onRegionChange}
        onRegionChangeComplete={this.onRegionChangeComplete}
      >
        {blocks &&
          blocks.map(block => (
            <Block
              key={block.id}
              block={block}
              selectedId={selectedBlock && selectedBlock.id}
              dayIndexInWeek={dayIndexInWeek}
              dayIndexInMonth={dayIndexInMonth}
              currentHour={currentHour}
              pressHandler={this.selectBlock}
            />
          ))}
        {parkedBlock && (
          <Marker
            title="Parked vehicle"
            coordinate={{
              latitude: parkedBlock.ll_lat,
              longitude: parkedBlock.ll_lon
            }}
          />
        )}
        <View style={styles.top}>
          <Text style={styles.text}>
            {nextSweeping
              ? selectedBlockInfo
              : "Press part of the map to view parking info"}
          </Text>
        </View>
        {/* {(selectedBlock || parkedBlock) && (
          // <View style={styles.bottom}>
          <Button
            style={styles.bottom}
            title={
              selectedBlock && parkedBlock !== selectedBlock
                ? "Park here"
                : "Unpark"
            }
            onPress={this.toggleParking()}
          />
          // </View>
        )} */}
      </MapView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center"
    // justifyContent: "center"
  },
  top: {
    position: "absolute",
    width: "100%",
    height: "10%",
    margin: "10%",
    display: "flex",
    backgroundColor: "lightgrey",
    borderRadius: 10,
    shadowColor: "black",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 2, height: 4 }
  },
  bottom: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "10%",
    margin: "10%",
    display: "flex",
    backgroundColor: "lightgrey",
    borderRadius: 10,
    shadowColor: "black",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 2, height: 4 }
  },
  text: {
    // margin: "10%",
    flex: 1,
    position: "absolute",
    top: 0,
    fontSize: 16,
    textAlign: "center"
  }
});
