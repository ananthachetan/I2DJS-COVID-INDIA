<template>
    <div class="main-container">
        <v-progress-linear :active="showProgress" indeterminate color="orange"> </v-progress-linear>
        <v-main>
            <v-container class="fill-height align-content-start" fluid>
                <div
                    :class="[
                        $vuetify.breakpoint.smAndDown
                            ? 'flex-fill  my-2 align-self-start px-2'
                            : 'header--floater header-title ma-4',
                    ]"
                    class="d-flex align-center"
                >
                    <a
                        class="nav-icon mr-4"
                        rel="noopener"
                        href="https://github.com/nswamy14/I2DJS-COVID-INDIA"
                        target="_blank"
                    >
                        <img alt="I2Djs Covid India logo" src="~assets/img/logo.png" />
                    </a>
                    <div class="d-flex flex-column">
                        <div class="title"><strong>COVID-19</strong> INDIA</div>
                        <div class="subtitle-2 text--secondary">
                            Showing district level data of
                            <span class="font-weight-bold primary--text text-uppercase">
                                {{ selectedCounter.label }}
                            </span>
                            cases
                        </div>
                    </div>
                </div>

                <counters-view
                    :class="[
                        $vuetify.breakpoint.smAndDown
                            ? 'flex-fill px-4 mt-2'
                            : 'counters--floater ma-4',
                    ]"
                    :counters="mainCounter"
                    v-if="mainCounter"
                ></counters-view>

                <div :class="[[this.$vuetify.breakpoint.name]]" class="info-window">
                    <div class="toolbar d-flex align-center flex-wrap justify-center mt-2">
                        <v-autocomplete
                            :items="searchItems"
                            item-text="label"
                            :menu-props="{
                                light: true,
                                nudgeBottom: 5,
                            }"
                            class="mr-2 search"
                            clearable
                            dense
                            hide-details
                            hide-selected
                            label="Search by State or District"
                            light
                            prepend-inner-icon="$mapSearch"
                            solo
                            return-object
                            v-model="search"
                            :filter="districtSearch"
                        >
                        </v-autocomplete>
                        <v-menu :close-on-click="true">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    color="text-secondary"
                                    height="2.5rem"
                                    light
                                    v-bind="attrs"
                                    v-on="on"
                                    width="9.5rem"
                                    class="d-flex justify-space-between align-center"
                                >
                                    <div class="d-flex align-center">
                                        <span
                                            :class="[
                                                selectedCounter.key,
                                                [$vuetify.breakpoint.name],
                                            ]"
                                            class="color mr-1"
                                        ></span>
                                        <span class="caption">{{ selectedCounter.label }}</span>
                                    </div>

                                    <v-icon color="grey darken-2">$menuDown</v-icon>
                                </v-btn>
                            </template>

                            <v-list color="text-secondary" dense light width="9.5rem">
                                <v-list-item
                                    :key="index"
                                    @click="selectedCounter = item"
                                    class="px-2"
                                    v-for="(item, index) in counters"
                                >
                                    <span
                                        :class="[item.key, [$vuetify.breakpoint.name]]"
                                        class="color mr-1"
                                    ></span>
                                    <span class="caption text-uppercase">{{ item.label }}</span>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                    <v-expand-transition>
                        <district-view :districtInfo="districtInfo" v-if="search"></district-view>
                    </v-expand-transition>
                </div>

                <div :class="['map-container', [this.$vuetify.breakpoint.name]]">
                    <map-container
                        :covidDistrictData="covidDistrictData"
                        :dataRange="dataRange"
                        :dataType="dataType"
                        :searchGeoLocation="searchGeoLocation"
                        id="map-container"
                        v-if="covidDistrictData.length !== 0"
                    >
                    </map-container>
                </div>

                <div
                    :class="[{ floater: $vuetify.breakpoint.smAndUp }]"
                    class="mx-4 d-flex align-end timeline-container"
                >
                    <!--                    <div class="d-flex flex-column align-center">-->
                    <!--                        <v-chip v-if="currentDate" color="teal darken-1" x-small class="mx-2 mb-2">-->
                    <!--                            <span class="caption">Date: </span>-->
                    <!--                            <span class="caption font-weight-bold">{{ currentDate }}</span>-->
                    <!--                        </v-chip>-->
                    <!--                        <v-fab-transition>-->
                    <!--                            <v-btn-->
                    <!--                                :small="$vuetify.breakpoint.md"-->
                    <!--                                :x-small="$vuetify.breakpoint.smAndDown"-->
                    <!--                                @click="startTimelineAnimation"-->
                    <!--                                color="orange"-->
                    <!--                                fab-->
                    <!--                                key="play"-->
                    <!--                                aria-label="Play"-->
                    <!--                                light-->
                    <!--                                v-if="!animFlag"-->
                    <!--                            >-->
                    <!--                                <v-icon :x-large="$vuetify.breakpoint.lgAndUp">$play</v-icon>-->
                    <!--                            </v-btn>-->
                    <!--                            <v-btn-->
                    <!--                                :small="$vuetify.breakpoint.md"-->
                    <!--                                :x-small="$vuetify.breakpoint.smAndDown"-->
                    <!--                                @click="stopTimelineAnimation"-->
                    <!--                                color="deep-orange"-->
                    <!--                                fab-->
                    <!--                                aria-label="Stop"-->
                    <!--                                key="pause"-->
                    <!--                                light-->
                    <!--                                v-else-->
                    <!--                            >-->
                    <!--                                <v-icon :x-large="$vuetify.breakpoint.lgAndUp">$stop</v-icon>-->
                    <!--                            </v-btn>-->
                    <!--                        </v-fab-transition>-->
                    <!--                    </div>-->
                    <!-- <v-fab-transition>
                        <v-btn
                            :small="$vuetify.breakpoint.md"
                            :x-small="$vuetify.breakpoint.smAndDown"
                            @click="startTimelineAnimation"
                            color="orange"
                            fab
                            key="play"
                            aria-label="Play"
                            light
                            v-if="!animFlag"
                        >
                            <v-icon :x-large="$vuetify.breakpoint.lgAndUp">$play</v-icon>
                        </v-btn>
                        <v-btn
                            :small="$vuetify.breakpoint.md"
                            :x-small="$vuetify.breakpoint.smAndDown"
                            @click="stopTimelineAnimation"
                            color="deep-orange"
                            fab
                            aria-label="Stop"
                            key="pause"
                            light
                            v-else
                        >
                            <v-icon :x-large="$vuetify.breakpoint.lgAndUp">$stop</v-icon>
                        </v-btn>
                    </v-fab-transition> -->
                    <timeline-view
                        :timelineData="timelineData"
                        :playFlag="animFlag"
                        id="timeline-container"
                        @timeSelected="onTimeSelected"
                        v-if="timelineData.data.length !== 0"
                    >
                    </timeline-view>
                </div>
            </v-container>
        </v-main>
        <v-footer app class="flex-wrap justify-center transparent">
            <div
                :class="[$vuetify.breakpoint.xs ? 'flex-fill' : 'update-time-floater ma-2']"
                class="overline text--secondary"
            >
                Last updated on <span class="text--primary">{{ formattedDate }}</span>
            </div>
            <span class="subtitle-2">
                Made with
                <span class="red--text text--darken-4">&#10084;</span> in
                <a rel="noopener" href="https://github.com/I2Djs/I2Djs" target="_blank">I2Djs </a>
            </span>
        </v-footer>
    </div>
</template>

<script>
import _ from "lodash";
import TimelineView from "./TimelineView";
import MapContainer from "./MapContainer";
import DistrictView from "./DistrictView";
import CountersView from "./CountersView";

import {
    getDistrictWiseDailyData,
    getIndianCities,
    getIndianDistrictGeoJson,
    getTimelineDailyData,
    getIndianStatesGeoJson,
    getPastCovidData,
} from "@/api/Services";

import formatDataMixin from "../mixins/formatDataMixin";
import { convertToIndianFormat, getFormattedSelectItems, GEO_JSON } from "./helper";

export default {
    name: "MainView",
    components: { DistrictView, TimelineView, MapContainer, CountersView },
    mixins: [formatDataMixin],
    data() {
        return {
            showProgress: false,
            search: "",
            searchGeoLocation: {},
            searchItems: [],
            selectedCounter: {},
            counters: [
                {
                    label: "Confirmed",
                    key: "confirmed",
                    data: [],
                    color: "red",
                    colorHex: "#F44336",
                    scale: [Infinity, -Infinity],
                },
                {
                    label: "Active",
                    key: "active",
                    data: [],
                    color: "light-blue",
                    colorHex: "#29b6f6",
                    scale: [Infinity, -Infinity],
                },
                {
                    label: "Recovered",
                    key: "recovered",
                    data: [],
                    color: "green",
                    colorHex: "#4CAF50",
                    scale: [Infinity, -Infinity],
                },
                {
                    label: "Deceased",
                    key: "deceased",
                    data: [],
                    color: "grey",
                    colorHex: "#9E9E9E",
                    scale: [Infinity, -Infinity],
                },
            ],
            covidDistrictData: [],
            heatmapDataMap: {},
            dataRange: [],
            timelineData: {
                data: [],
            },
            formattedCovidData: [],
            dataType: "Active",
            animFlag: false,
            districtInfo: {},
            IndianCitiesLatLong: {},
            currentDate: "",
            lastUpdatedTime: new Date(),
        };
    },

    watch: {
        selectedCounter(val) {
            // N: Change it to key
            this.dataType = val.label;
            this.timelineData = val;
        },

        search(val) {
            if (val && val.type === "District" && this.heatmapDataMap[val.label.toLowerCase()]) {
                this.searchGeoLocation = this.heatmapDataMap[val.label.toLowerCase()];
                this.getDistrictTimelineData(val.label.toLowerCase());
            } else if (
                val &&
                val.type === "State" &&
                this.formattedCovidStateData[val.label.toLowerCase()]
            ) {
                this.searchGeoLocation = this.formattedCovidStateData[val.label.toLowerCase()];
                this.getStateTimelineData(val.label.toLowerCase());
            } else {
                this.searchGeoLocation = {};
            }
        },
    },

    computed: {
        mainCounter() {
            let countersArr = [];
            _.forEach(this.counters, (counter) => {
                let data = counter.data || [];
                let total = (data[data.length - 1] && data[data.length - 1].value) || 0;
                let previousDayCount = (data[data.length - 2] && data[data.length - 2].value) || 0;
                let increaseCount = total - previousDayCount;
                countersArr.push({
                    color: counter.color,
                    colorHex: counter.colorHex,
                    label: counter.label,
                    key: counter.key,
                    total: convertToIndianFormat(total),
                    direction: increaseCount < 0 ? "down" : "up",
                    increaseCount: convertToIndianFormat(Math.abs(increaseCount)),
                    data: data,
                    scale: counter.scale,
                });
            });
            return countersArr;
        },

        formattedDate() {
            if (this.lastUpdatedTime) {
                return this.formatDate(this.lastUpdatedTime);
            } else {
                return "";
            }
        },
    },
    mounted() {
        this.selectedCounter = this.counters[1];
        this.initialize();
    },

    methods: {
        districtSearch(item, queryText, itemText) {
            let queryTextUpperCase = queryText.toUpperCase();
            return item.label && item.label.toUpperCase().indexOf(queryTextUpperCase) !== -1;
        },

        async initialize() {
            let self = this;

            self.showProgress = true;

            let [IndianCities, covidData, timelineDailyData] = await Promise.all([
                this.getIndianCities(),
                this.getDistrictWiseDailyData(),
                this.getTimelineDailyData(),
                this.getIndianDistrictGeoJson(),
                this.getIndianStatesGeoJson(),
            ]);
            let activeRange = [Infinity, -Infinity];
            let dateBuckets = {};
            let dateStateBuckets = {};

            let distMap = [];
            let stateMap = {};

            let currDate = this.formatDate(new Date(), "year");

            this.IndianCitiesLatLong = IndianCities;
            for (let state in covidData) {
                let stateVal = covidData[state];
                let districts = stateVal.districtData;
                let stateLow = state.toLowerCase();

                let stateDd = IndianCities[stateLow] || {};
                let stateObj = {
                    name: stateLow,
                    label:
                        stateLow.charAt(0).toUpperCase() + stateLow.substr(1, stateLow.length - 1),
                    state: state,
                    active: 0,
                    deceased: 0,
                    confirmed: 0,
                    recovered: 0,
                    longitude: stateDd.longitude,
                    latitude: stateDd.latitude,
                    timelineData: {},
                    type: "state",
                };

                for (let dis in districts) {
                    // let pastDisVal = statePastData[dis] || [];
                    let disVal = districts[dis];
                    let disLow = dis.toLowerCase();

                    // _.forEach(disVal, function (dt) {
                    //     dt.visible = false;
                    // });

                    let dd = IndianCities[disLow];

                    if (!dd && disLow === "unknown") {
                        disLow = stateLow;
                        dd = IndianCities[stateLow];
                    }

                    if (dd && !self.heatmapDataMap[disLow]) {
                        let active = disVal.active;
                        let districtObj = {
                            name: disLow,
                            label:
                                disLow.charAt(0).toUpperCase() +
                                disLow.substr(1, disLow.length - 1),
                            state: state,
                            active: disVal.active,
                            deceased: disVal.deceased,
                            confirmed: disVal.confirmed,
                            recovered: disVal.recovered,
                            longitude: dd.longitude,
                            latitude: dd.latitude,
                            type: "district",
                        };

                        if (Math.sqrt(active) > activeRange[1]) {
                            activeRange[1] = Math.sqrt(active);
                        }
                        if (Math.sqrt(active) <= activeRange[0] && active > 0) {
                            activeRange[0] = Math.sqrt(active);
                        }

                        // _.forEach(disVal, function (d) {
                        //     if (!dateBuckets[d.date]) {
                        //         dateBuckets[d.date] = [];
                        //     }
                        //     if (!stateObj.timelineData[d.date]) {
                        //         stateObj.timelineData[d.date] = {
                        //             confirmed: 0,
                        //             active: 0,
                        //             deceased: 0,
                        //             recovered: 0,
                        //             date: new Date(d.date),
                        //         };
                        //     }

                        //     stateObj.timelineData[d.date].confirmed += d.confirmed;
                        //     stateObj.timelineData[d.date].active += d.active;
                        //     stateObj.timelineData[d.date].deceased += d.deceased;
                        //     stateObj.timelineData[d.date].recovered += d.recovered;

                        //     d.dis = disLow;
                        //     dateBuckets[d.date].push(d);

                        //     if (Math.sqrt(d.active) > activeRange[1]) {
                        //         activeRange[1] = Math.sqrt(d.active);
                        //     }
                        //     if (Math.sqrt(d.active) <= activeRange[0] && d.active > 0) {
                        //         activeRange[0] = Math.sqrt(d.active);
                        //     }
                        // });
                        stateObj.confirmed += disVal.confirmed;
                        stateObj.active += disVal.active;
                        stateObj.deceased += disVal.deceased;
                        stateObj.recovered += disVal.recovered;

                        distMap.push(districtObj);
                        self.heatmapDataMap[districtObj.name] = districtObj;
                    } else {
                        // _.forEach(disVal, function (d) {
                        //     if (!dateBuckets[d.date]) {
                        //         dateBuckets[d.date] = [];
                        //     }
                        //     d.dis = disLow;
                        //     dateBuckets[d.date].push(d);

                        //     if (Math.sqrt(d.active) > activeRange[1]) {
                        //         activeRange[1] = Math.sqrt(d.active);
                        //     }
                        //     if (Math.sqrt(d.active) <= activeRange[0] && d.active > 0) {
                        //         activeRange[0] = Math.sqrt(d.active);
                        //     }
                        // });
                        // if (disVal[disVal.length - 1].date === currDate) {
                        stateObj.confirmed += disVal.confirmed;
                        stateObj.active += disVal.active;
                        stateObj.deceased += disVal.deceased;
                        stateObj.recovered += disVal.recovered;
                        // }
                    }
                }
                stateMap[stateObj.name] = stateObj;
            }

            console.log(timelineDailyData);
            let keys = Object.keys(timelineDailyData);
            for (var i = 0; i < keys.length; i++) {
                let state = keys[i];
                let stateObj = timelineDailyData[state];
                let dates = Object.keys(stateObj.dates);
                if (state === "TT") {
                    continue;
                }
                dates.forEach(function (dt) {
                    let obj = stateObj.dates[dt].total || {
                        confirmed: 0,
                        recovered: 0,
                        deceased: 0,
                        active: 0,
                    };
                    if (!obj.recovered) {
                        obj.recovered = 0;
                    }
                    if (!obj.confirmed) {
                        obj.confirmed = 0;
                    }
                    if (!obj.deceased) {
                        obj.deceased = 0;
                    }
                    if (!dateBuckets[dt]) {
                        dateBuckets[dt] = {
                            date: new Date(dt),
                            confirmed: obj.confirmed,
                            active: obj.confirmed - obj.recovered - obj.deceased,
                            recovered: obj.recovered,
                            deceased: obj.deceased,
                        };
                    } else {
                        (dateBuckets[dt].confirmed += obj.confirmed),
                            (dateBuckets[dt].active +=
                                obj.confirmed - obj.recovered - obj.deceased),
                            (dateBuckets[dt].recovered += obj.recovered),
                            (dateBuckets[dt].deceased += obj.deceased);
                    }
                });
            }

            self.formattedCovidStateData = stateMap;
            self.formattedCovidData = self.formatData(dateBuckets);
            self.covidDistrictData = distMap;
            self.dataRange = activeRange;

            let districts = [];
            let states = [];

            _.forEach(self.heatmapDataMap, (value, district) => {
                districts.push({
                    label: _.capitalize(district),
                    type: "District",
                });
                if (states.indexOf(value.state) === -1) {
                    states.push(value.state);
                }
            });

            states = _.map(states, (state) => {
                return {
                    label: _.capitalize(state),
                    type: "State",
                };
            });

            states = _.sortBy(states, (state) => state.label);
            districts = _.sortBy(districts, (district) => district.label);

            self.searchItems = getFormattedSelectItems([...states, ...districts], "type");

            self.updateCounters();
            // self.updateHeatmapData();

            self.timelineData = self.selectedCounter;

            await self.$nextTick();
            self.showProgress = false;
        },

        async getDistrictWiseDailyData() {
            try {
                let response = await getDistrictWiseDailyData();
                return response;
            } catch (e) {
                console.error(e);
            }
        },

        async getTimelineDailyData() {
            try {
                let response = await getTimelineDailyData();
                return response;
            } catch (e) {
                console.error(e);
            }
        },

        async getIndianCities() {
            try {
                let response = await getIndianCities();
                GEO_JSON.latlong = response;
                return response;
            } catch (e) {
                console.error(e);
            }
        },

        async getIndianDistrictGeoJson() {
            try {
                let response = await getIndianDistrictGeoJson();
                GEO_JSON.districtGeoData = response;
            } catch (e) {
                console.error(e);
            }
        },

        async getIndianStatesGeoJson() {
            try {
                let response = await getIndianStatesGeoJson();
                GEO_JSON.stateGeoData = response;
            } catch (e) {
                console.error(e);
            }
        },

        async getPastCovidData() {
            try {
                let response = await getPastCovidData();
                return response;
            } catch (e) {
                console.error(e);
            }
        },

        getStateTimelineData(state) {
            let stateObj = this.formattedCovidStateData[state];
            let dateArr = [];
            for (let key in stateObj.timelineData) {
                dateArr.push(stateObj.timelineData[key]);
            }
            dateArr = dateArr.sort(function (a, b) {
                return a.date - b.date;
            });

            console.log(dateArr);

            this.districtInfo = {
                name: stateObj.name,
                label: stateObj.label,
                confirmed: stateObj.confirmed,
                active: stateObj.active,
                deceased: stateObj.deceased,
                recovered: stateObj.recovered,
                data:
                    dateArr.length > 45
                        ? dateArr.slice(dateArr.length - 45, dateArr.length)
                        : dateArr,
            };
        },

        getDistrictTimelineData(dist) {
            let obj = this.heatmapDataMap[dist.toLowerCase()];
            // this.formattedCovidData.map((date) => {
            //     return date["distList"].filter((distObj) => {
            //         return distObj["dis"] === dist;
            //     });
            // });
            // data = data.filter((d) => d.length !== 0);
            // data = data.map(function (d) {
            //     return d[0];
            // });
            // if (data.length !== 0) {
            // let obj = data[data.length - 1];
            this.districtInfo = {
                name: obj.dis,
                confirmed: obj.confirmed,
                active: obj.active,
                deceased: obj.deceased,
                recovered: obj.recovered,
                data: [],
                // data.length > 45 ? data.splice(data.length - 45, 45) : data,
            };
            // } else {
            //     this.districtInfo = {
            //         name: dist,
            //         data: [],
            //     };
            // }
        },

        updateCounters() {
            let self = this;
            self.clearCounters();
            _.forEach(self.formattedCovidData, function (d) {
                let dt = self.formatDate(d.date);
                self.counters[0].data.push({
                    value: d.confirmed,
                    date: dt,
                });
                self.counters[1].data.push({
                    value: d.active,
                    date: dt,
                });
                self.counters[2].data.push({
                    value: d.recovered,
                    date: dt,
                });
                self.counters[3].data.push({
                    value: d.deceased,
                    date: dt,
                });
            });
        },

        updateHeatmapData() {
            let self = this;
            let d = this.formattedCovidData[this.formattedCovidData.length - 1];
            let distData = d.distList;
            for (var i = 0; i < distData.length; i++) {
                let item = distData[i];
                if (self.heatmapDataMap[item["dis"]]) {
                    self.heatmapDataMap[item["dis"]].active = item.active;
                    self.heatmapDataMap[item["dis"]].confirmed = item.confirmed;
                    self.heatmapDataMap[item["dis"]].deceased = item.deceased;
                    self.heatmapDataMap[item["dis"]].recovered = item.recovered;
                }
            }
        },

        clearCounters() {
            this.counters[0].data = [];
            this.counters[1].data = [];
            this.counters[2].data = [];
            this.counters[3].data = [];
        },

        clearHeatMapData() {
            for (let key in this.heatmapDataMap) {
                this.heatmapDataMap[key].confirmed = 0;
                this.heatmapDataMap[key].active = 0;
                this.heatmapDataMap[key].deceased = 0;
                this.heatmapDataMap[key].recovered = 0;
            }
        },

        startTimelineAnimation() {
            this.animFlag = true;
            this.clearCounters();
            this.clearHeatMapData();
            this.animateCovid(this.formattedCovidData);
        },

        onTimeSelected(index, flag) {
            let self = this;
            let currData = this.formattedCovidData[index];
            let distList = currData.distList;
            let disMap = distList.reduce(function (p, c) {
                p[c.dis] = c;
                return p;
            }, {});
            for (var i = 0; i < this.covidDistrictData.length; i++) {
                let d = this.covidDistrictData[i];
                if (disMap[d.name]) {
                    d.active = disMap[d.name].active;
                    d.confirmed = disMap[d.name].confirmed;
                    d.deceased = disMap[d.name].deceased;
                    d.recovered = disMap[d.name].recovered;
                } else {
                    d.active = 0;
                    d.confirmed = 0;
                    d.deceased = 0;
                    d.recovered = 0;
                }
            }
        },

        stopTimelineAnimation() {
            let self = this;
            self.animFlag = false;
            self.currentDate = "";
            self.updateCounters();
            self.updateHeatmapData();
        },

        resetTimelineData() {},

        animateCovid(covidData) {
            let self = this;
            let playIndex = 0;

            function Play() {
                if (!self.animFlag) {
                    self.currentDate = "";
                    return;
                }
                if (!covidData[playIndex]) {
                    self.animFlag = false;
                    self.currentDate = "";
                    return;
                }
                let currData = covidData[playIndex];
                self.currentDate = self.formatDate(currData.date);

                self.counters[0].data.push({
                    value: currData.confirmed,
                    date: self.currentDate,
                });

                self.counters[1].data.push({
                    value: currData.active,
                    date: self.currentDate,
                });

                self.counters[2].data.push({
                    value: currData.recovered,
                    date: self.currentDate,
                });

                self.counters[3].data.push({
                    value: currData.deceased,
                    date: self.currentDate,
                });

                let distList = currData.distList;
                _.forEach(distList, function (item) {
                    if (self.heatmapDataMap[item["dis"]]) {
                        self.heatmapDataMap[item["dis"]].active = item.active;
                        self.heatmapDataMap[item["dis"]].confirmed = item.confirmed;
                        self.heatmapDataMap[item["dis"]].deceased = item.deceased;
                        self.heatmapDataMap[item["dis"]].recovered = item.recovered;
                    }
                });

                playIndex += 1;
                setTimeout(Play, 100);
            }

            Play();
        },

        formatData(dateBuckets) {
            let self = this;
            let dtKeys = Object.keys(dateBuckets);
            let dateData = [];
            let confirmScale = [Infinity, -Infinity];
            let totalDateItems = 0;
            _.forEach(dtKeys, function (dt) {
                let curr = dateBuckets[dt];
                let dataObj = {
                    date: new Date(dt),
                    confirmed: curr.confirmed,
                    active: curr.active,
                    recovered: curr.recovered,
                    deceased: curr.deceased,
                    distList: curr,
                    type: "district",
                };
                // curr.reduce(function (p, c) {
                //     p.active += c.active;
                //     p.recovered += c.recovered;
                //     p.deceased += c.deceased;
                //     p.confirmed += c.confirmed;
                //     return p;
                // }, dataObj);

                confirmScale[0] = Math.min(confirmScale[0], dataObj.confirmed);
                confirmScale[1] = Math.max(confirmScale[1], dataObj.confirmed);

                dateData.push(dataObj);
                totalDateItems += 1;
            });

            dateData = dateData.sort(function (a, b) {
                return a.date - b.date;
            });

            _.forEach(self.counters, function (d) {
                d.scale = confirmScale;
                d.dateCount = totalDateItems;
            });

            return dateData;
        },
    },
};
</script>
<style scoped>
.main-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-flow: column nowrap;
}

.header--floater {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
}

.nav-icon {
    width: 4rem;
    height: 4rem;
}

.header-title {
    width: 30vw;
}

.counters--floater {
    z-index: 1;
    position: absolute;
    top: 0;
    right: 0;
}

.info-window {
    position: absolute;
    z-index: 1;
    top: 8rem;
}

.info-window.xs {
    top: 13rem;
    left: calc(50% - 12rem);
}

.search {
    max-width: 17.5rem;
}

.map-container {
    height: 100%;
    width: 100%;
}

.map-container.sm {
    margin-top: 5rem;
    height: calc(100% - 14rem);
}

.map-container.xs {
    margin-top: 5rem;
    height: 100vmin;
}

.timeline-container {
    width: calc(100% - 2rem);
    height: 5rem;
}

.date-container {
    height: 0.5rem;
}

.timeline-container.floater {
    position: absolute;
    bottom: 0;
}

.update-time-floater {
    position: absolute;
    right: 0;
    top: 0;
}
</style>
