import { geoMercator, geoPath } from "d3";
import * as i2d from "i2djs";
import _ from "lodash";
import { vertexShader, fragmentShader } from "./shaders";

export default function () {
    // var heatmapLinearScale = d3.scaleLinear();
    let scaleRange = [0, 0];
    let scaleDomain = [0, 0];
    function scaleFun(count) {
        let domainDiff = scaleDomain[1] - scaleDomain[0] || 1;
        return (
            scaleRange[0] +
            ((count - scaleDomain[0]) / domainDiff) * (scaleRange[1] - scaleRange[0])
        );
    }

    let districtGeoData = {};
    let stateGeoData = {};
    let latlong = {};

    var ActiveColorGrad = [
        {
            color: [0, 0, 0, 0.0],
            offset: 0,
        },
        {
            color: [0, 0, 0, 0.0],
            offset: 0.05,
        },
        {
            color: [114, 179, 77, 0.8],
            offset: 0.5,
        },
        {
            color: [205, 205, 0, 1.0],
            offset: 0.8,
        },
        {
            color: [255, 0, 0, 1.0],
            offset: 1.0,
        },
    ];

    var RecoveredColorGrad = [
        {
            color: [0, 0, 0, 0.1],
            offset: 0,
        },
        {
            color: [166, 255, 115, 0.4],
            offset: 0.4,
        },
        {
            color: [166, 255, 115, 1.0],
            offset: 1.0,
        },
    ];

    var DeceasedColorGrad = [
        {
            color: [0, 0, 0, 0.1],
            offset: 0,
        },
        {
            color: [255, 255, 0, 0.5],
            offset: 0.3,
        },
        {
            color: [255, 255, 0, 1.0],
            offset: 1.0,
        },
    ];

    var sqrt = Math.sqrt;
    var ActiveColorGradMap = gradientMapper(ActiveColorGrad);
    var RecoveredColorGradMap = gradientMapper(RecoveredColorGrad);
    var DeceasedColorGradMap = gradientMapper(DeceasedColorGrad);
    var ConfirmedColorGradMap = ActiveColorGradMap;
    var colorGradMap = ActiveColorGradMap;
    var heatmapShader;
    var dataType = "";
    var showTooltipFunc;
    var hideTooltipFunc;
    var fontSize = 10;
    let Chart = function () {};

    Chart.prototype.dataType = function (val) {
        dataType = val.toLowerCase();
        if (dataType === "active") {
            colorGradMap = ActiveColorGradMap;
        } else if (dataType === "deceased") {
            colorGradMap = DeceasedColorGradMap;
        } else if (dataType === "recovered") {
            colorGradMap = RecoveredColorGradMap;
        } else if (dataType === "confirmed") {
            colorGradMap = ConfirmedColorGradMap;
        }
        if (heatmapShader) {
            heatmapShader.setUniformData("u_colorArr", colorGradMap.value);
            heatmapShader.setUniformData("u_offset", colorGradMap.offset);
        }
    };

    Chart.prototype.geoJSON = function (GEO_JSON) {
        districtGeoData = GEO_JSON.districtGeoData;
        stateGeoData = GEO_JSON.stateGeoData;
        latlong = GEO_JSON.latlong;
    };

    // let prevZoom = {
    // 	loc: null,
    // 	transform: null
    // };

    Chart.prototype.mapRest = function () {
        let translate = this.zoomInstance.event.transform.translate;
        let scale = this.zoomInstance.event.transform.scale[0];
        this.webglRenderer.scaleTo(1, [
            (this.webglRenderer.width / 2 - translate[0]) / scale,
            (this.webglRenderer.height / 2 - translate[1]) / scale,
        ]);
        this.zoomInstance.zoomTarget([this.webglRenderer.width / 2, this.webglRenderer.height / 2]);
    };

    Chart.prototype.zoomIn = function () {
        let scale = this.zoomInstance.event.transform.scale[0];
        if (scale + 1 > 15) {
            return;
        }
        this.webglRenderer.scaleTo(scale + 1, [
            this.webglRenderer.width / 2,
            this.webglRenderer.height / 2,
        ]);
    };

    Chart.prototype.zoomOut = function () {
        let scale = this.zoomInstance.event.transform.scale[0];
        if (scale - 1 < 1) {
            return;
        }
        this.webglRenderer.scaleTo(scale - 1, [
            this.webglRenderer.width / 2,
            this.webglRenderer.height / 2,
        ]);
    };
    let prevNode;
    Chart.prototype.zoomToLocation = function (location) {
        let translate = this.zoomInstance.event.transform.translate;
        let scale = this.zoomInstance.event.transform.scale[0];
        if (prevNode) {
            prevNode.setStyle("lineWidth", null);
            prevNode.setStyle("strokeStyle", null);
        }
        if (!_.isEmpty(location)) {
            let xy = this.projection([location.longitude, location.latitude]);
            let rawXY = [xy[0], xy[1]];
            xy[0] *= scale;
            xy[1] *= scale;
            xy[0] += translate[0];
            xy[1] += translate[1];
            let node;
            if (location.type === "district") {
                node = this.distG.fetchEl("." + location.name);
                if (node) {
                    node.setStyle("lineWidth", 0.25);
                    node.setStyle("strokeStyle", "#33c4cc");
                    prevNode = node;
                }
            } else if (location.type === "state") {
                node = this.stateG.fetchEl("." + location.name);
                if (node) {
                    node.setStyle("lineWidth", 0.75);
                    node.setStyle("strokeStyle", "#33c4cc");
                    prevNode = node;
                }
            }

            this.webglRenderer.scaleTo(location.type === "district" ? 8 : 4, xy);
        } else {
            // let child = this.distG.children;
            // for (var i = 0; i < child.length; i++) {
            //     child[i].setStyle("lineWidth", null);
            //     child[i].setStyle("strokeStyle", null);
            // }
            // this.webglRenderer.scaleTo(1, [
            //     this.webglRenderer.width / 2,
            //     this.webglRenderer.height / 2,
            // ]);
            // this.zoomInstance.zoomTarget([
            //     this.webglRenderer.width / 2,
            //     this.webglRenderer.height / 2,
            // ]);
        }
    };

    Chart.prototype.dataRange = function (range) {
        // heatmapLinearScale.domain(range);
        scaleDomain = range;
    };

    Chart.prototype.initialize = function (districtData) {
        let self = this;
        self.districtData = districtData;
        self.zoomInstance = i2d.behaviour.zoom();
        self.zoomInstance.scaleExtent([1, 15]);
        self.zoomInstance.zoomStart(zoomStart);
        self.zoomInstance.zoom(onZoom);
        self.zoomInstance.zoomFactor(0.005);
        self.zoomInstance.zoomEnd(zoomEnd);
        self.zoomInstance.duration(500);

        self.zoomInstance.panExtent([
            [-10000, -10000],
            [10000, 10000],
        ]);

        self.renderGeoMap(districtData);
        self.renderHeatMap(districtData);

        function zoomStart(event) {
            if (hideTooltipFunc) {
                hideTooltipFunc();
            }
        }

        function onZoom(event) {
            var scale = event.transform.scale[0];
            var sqrtScale = sqrt(1 / scale);
            self.geoGroup.setAttr("transform", event.transform);
            self.heatmapHref.setAttr("transform", event.transform);
            // self.labelHref.setAttr("transform", event.transform);

            var nodes = self.heatmapHref.children;

            self.distG.setStyle("lineWidth", 0.2 / scale);
            self.stateG.setStyle("lineWidth", 0.4 / scale);

            for (var i = nodes.length - 1; i >= 0; i--) {
                var d = nodes[i].data();
                var val = d.d[dataType];
                val = val <= 0 ? 0 : scaleFun(sqrt(val));

                nodes[i]
                    .setAttr("width", val * sqrtScale)
                    .setAttr("height", val * sqrtScale)
                    .setAttr("x", d.xy[0] - val * 0.5 * sqrtScale)
                    .setAttr("y", d.xy[1] - val * 0.5 * sqrtScale);
            }
        }

        function zoomEnd(event) {
            var scale = event.transform.scale[0];
            var sqrtScale = sqrt(1 / scale);
            var defaultFontSize = getDefaultFontSize();
            self.labelGroup.setStyle("font", defaultFontSize[0] * 0.4 * sqrtScale + "px Arial");

            if (scale >= 3.5) {
                self.labelGroup.setStyle("display", "block");
            } else {
                self.labelGroup.setStyle("display", "none");
            }
        }
    };

    Chart.prototype.resize = function () {
        let self = this;
        let mindim = Math.min(self.GeoMaprenderer.height, self.GeoMaprenderer.width);
        var defaultFontSize = getDefaultFontSize();
        self.projection
            .translate([self.GeoMaprenderer.width / 2, mindim / 2 + 50])
            .scale([mindim * 1.65]);

        self.stateG.fetchEls("path").forEach(function (d) {
            this.setAttr("d", self.path(d));
        });
        self.distG.fetchEls("path").forEach(function (d) {
            this.setAttr("d", self.path(d));
        });

        scaleRange = [defaultFontSize[0] * 0.75, defaultFontSize[0] * 5];
        self.zoomInstance.zoomTarget([self.webglRenderer.width / 2, self.webglRenderer.height / 2]);

        this.Texture.setAttr({
            width: self.webglRenderer.width * self.webglRenderer.pixelRatio,
            height: self.webglRenderer.height * self.webglRenderer.pixelRatio,
        });

        self.heatmapHref.data.forEach(function (d) {
            d.xy = self.projection([d.d.longitude, d.d.latitude]);
        });

        self.labelHref.update();
        self.heatmapHref.update();
    };

    Chart.prototype.update = function (argument) {
        this.heatmapHref.update();
    };

    Chart.prototype.renderGeoMap = function () {
        var self = this;
        var GeoMaprenderer = i2d.canvasLayer("#map-container", {}, { enableEvents: false });
        var mindim = Math.min(GeoMaprenderer.height, GeoMaprenderer.width);
        self.GeoMaprenderer = GeoMaprenderer;
        self.projection = geoMercator()
            .translate([GeoMaprenderer.width / 2, mindim / 2 + 50])
            .center([81, 20.593684])
            .scale([mindim * 1.65]);

        GeoMaprenderer.onResize(
            _.debounce(function () {
                self.resize();
            }, 250)
        );

        self.path = geoPath().projection(self.projection);

        renderLegend(GeoMaprenderer);

        this.geoGroup = GeoMaprenderer.createEl({
            el: "group",
        });

        this.stateG = this.geoGroup.createEl({
            el: "group",
            style: {
                strokeStyle: "#c74a4a",
                fillStyle: "rgba(0, 0, 1, 1)",
                lineWidth: 0.4,
            },
            bbox: false,
        });

        this.distG = this.geoGroup.createEl({
            el: "group",
            style: {
                strokeStyle: "#c74a4a",
                lineWidth: 0.2,
            },
            bbox: false,
        });

        var defaultFontSize = getDefaultFontSize();
        this.labelGroup = this.geoGroup.createEl({
            el: "group",
            attr: {
                transform: {
                    translate: [0, -2],
                },
            },
            style: {
                font: defaultFontSize[0] * 0.4 + "px Arial",
                fillStyle: "#dba9a9",
                textAlign: "center",
                display: "none",
            },
            bbox: false,
        });

        this.labelHref = this.labelGroup.join([], "text", {
            action: {
                enter: function (data) {
                    this.createEls(data["text"], {
                        el: "text",
                        attr: {
                            text: function (d) {
                                return d.properties.DISTRICT;
                            },
                        },
                    }).forEach(function (d) {
                        let latlng = latlong[d.properties.DISTRICT.toLowerCase()];
                        let xy = [0, 0];

                        if (latlng) {
                            d.longitude = latlng.longitude;
                            d.latitude = latlng.latitude;
                            xy = self.projection([latlng.longitude, latlng.latitude]);
                        } else {
                            // console.log(d.properties.DISTRICT);
                        }

                        this.setAttr("x", xy[0]);
                        this.setAttr("y", xy[1]);

                        this.on("zoom", self.zoomInstance)
                            .on("mousemove", function (e) {
                                var d = this.data();
                                if (e.pointerType === "touch") {
                                    return;
                                }
                                if (showTooltipFunc) {
                                    showTooltipFunc(d, e);
                                }
                            })
                            .on("mouseout", function (e) {
                                if (e.pointerType === "touch") {
                                    return;
                                }
                                if (hideTooltipFunc) {
                                    hideTooltipFunc();
                                }
                            });
                    });
                },
                update: function (nodes) {
                    nodes["text"].forEach(function (d) {
                        let xy = self.projection([d.longitude, d.latitude]);
                        this.setAttr("x", xy[0]);
                        this.setAttr("y", xy[1]);
                    });
                },
            },
        });

        renderGeoJson();

        function renderGeoJson() {
            self.stateG.createEls(stateGeoData.features, {
                el: "path",
                attr: {
                    d: function (d) {
                        return self.path(d);
                    },
                    class: function (d) {
                        return d.properties.ST_NM.toLowerCase();
                    },
                },
            });

            self.distG.createEls(districtGeoData.features, {
                el: "path",
                attr: {
                    d: function (d) {
                        return self.path(d);
                    },
                    class: function (d) {
                        return d.properties.DISTRICT.toLowerCase();
                    },
                },
            });

            self.labelHref.join(districtGeoData.features);
        }

        function renderLegend(renderer) {
            var linearGradiant = renderer.createLinearGradient({
                x1: 0,
                y1: 0,
                x2: 100,
                y2: 0,
                colorStops: [
                    {
                        color: "rgba(0, 0, 0, 0.0)",
                        value: 0,
                    },
                    {
                        color: "rgba(212, 225, 255, 0.5)",
                        value: 20,
                    },
                    {
                        color: "rgba(166, 255, 115, 0.8)",
                        value: 45,
                    },
                    {
                        color: "rgba(255, 255, 0, 1.0)",
                        value: 65,
                    },
                    {
                        color: "rgba(255, 0, 0, 1.0)",
                        value: 100.0,
                    },
                ],
            });

            renderer.createEl({
                el: "rect",
                attr: {
                    x: renderer.width - renderer.width * 0.2,
                    y: renderer.height - renderer.height * 0.15,
                    width: renderer.width * 0.15,
                    height: renderer.height * 0.03,
                },
                style: {
                    fillStyle: linearGradiant,
                },
            });

            renderer.createEl({
                el: "text",
                attr: {
                    x: renderer.width - renderer.width * 0.2,
                    y: renderer.height - renderer.height * 0.1,
                    text: "Low",
                },
                style: {
                    fillStyle: "#888",
                    textAlign: "center",
                },
            });

            renderer.createEl({
                el: "text",
                attr: {
                    x: renderer.width - renderer.width * 0.05,
                    y: renderer.height - renderer.height * 0.1,
                    text: "High",
                },
                style: {
                    fillStyle: "#f00",
                    textAlign: "center",
                },
            });
        }
    };

    Chart.prototype.renderHeatMap = function (data) {
        let self = this;
        var webglRenderer = i2d.webglLayer(
            "#map-container",
            {
                premultipliedAlpha: false,
                depth: false,
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: false,
            },
            {
                enableEvents: true,
                enableResize: false,
            }
        );
        this.webglRenderer = webglRenderer;
        let dimMin = Math.min(webglRenderer.width, webglRenderer.height);
        var defaultFontSize = getDefaultFontSize();
        scaleRange = [defaultFontSize[0] * 0.75, defaultFontSize[0] * 5];
        webglRenderer.setClearColor(i2d.color.rgba(0, 0, 0, 0));
        self.zoomInstance.zoomTarget([webglRenderer.width / 2, webglRenderer.height / 2]);
        webglRenderer.on("zoom", self.zoomInstance);
        this.webglRenderer = webglRenderer;

        this.Texture = webglRenderer.TextureObject({
            width: webglRenderer.width * webglRenderer.pixelRatio,
            height: webglRenderer.height * webglRenderer.pixelRatio,
            border: 0,
            format: "RGBA",
            type: "UNSIGNED_BYTE",
            warpS: "CLAMP_TO_EDGE",
            warpT: "CLAMP_TO_EDGE",
            magFilter: "LINEAR",
            minFilter: "LINEAR",
            mipMap: false,
        });

        var renderTarget = webglRenderer.RenderTarget({
            texture: this.Texture,
        });

        var imageGroup = webglRenderer.createEl({
            el: "group",
            attr: {
                shaderType: "image",
            },
            renderTarget: renderTarget,
            ctx: function (ctx) {
                ctx.enable(ctx.BLEND);
                ctx.blendEquation(ctx.FUNC_ADD);
                ctx.blendFunc(ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA);
                ctx.depthMask(true);
            },
        });

        var labelGroup = webglRenderer.createEl({
            el: "group",
            attr: {
                shaderType: "text",
            },
            style: {
                display: "none",
            },
        });

        var meshgeome = webglRenderer.MeshGeometry();
        meshgeome.setAttr("a_texCoord", {
            value: new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]),
            size: 2,
        });
        meshgeome.setDrawRange(0, 6);

        heatmapShader = webglRenderer.createShaderEl({
            fragmentShader: fragmentShader,
            vertexShader: vertexShader,
            uniforms: {
                u_colorArr: {
                    value: colorGradMap.value,
                    size: 4,
                },
                u_offset: {
                    value: colorGradMap.offset,
                    size: 1,
                },
                u_framebuffer: {
                    value: this.Texture,
                },
            },
            bbox: false,
            geometry: meshgeome,
        });

        var TextureIns = webglRenderer.TextureObject({
            width: 100,
            height: 100,
            src: getGradientImage(),
        });

        data = data.map(function (d) {
            let xy = self.projection([d.longitude, d.latitude]);
            return {
                xy: xy,
                d: d,
            };
        });

        this.heatmapHref = imageGroup.join(data, "image", {
            action: {
                enter: function (data) {
                    this.createEls(data["image"], {
                        el: "image",
                        attr: {
                            x: function (d) {
                                return d.xy[0];
                            },
                            y: function (d) {
                                return d.xy[1];
                            },
                            width: 0,
                            height: 0,
                            src: TextureIns,
                        },
                        style: {
                            opacity: 0,
                        },
                    })
                        .on("zoom", self.zoomInstance)
                        .on("click", function (e) {
                            var d = this.data();
                            if (showTooltipFunc) {
                                showTooltipFunc(d, e);
                            }
                        })
                        .on("mousemove", function (e) {
                            if (e.pointerType === "touch") {
                                return;
                            }
                            var d = this.data();
                            if (showTooltipFunc) {
                                showTooltipFunc(d, e);
                            }
                        })
                        .on("mouseout", function (e) {
                            if (e.pointerType === "touch") {
                                return;
                            }
                            if (hideTooltipFunc) {
                                hideTooltipFunc();
                            }
                        });
                },
                update: function (nodes) {
                    var scale = self.zoomInstance.event.transform.scale[0];
                    var sqrtScale = sqrt(1 / scale);
                    nodes["image"].forEach(function (dd) {
                        var d = dd.d;
                        var val = d[dataType];
                        val = val <= 0 ? 0 : scaleFun(sqrt(val));
                        var op = Math.log(val || 1) / 5;
                        op = op > 1.0 ? 1.0 : op;

                        this.animateTo({
                            duration: 100,
                            attr: {
                                width: val * sqrtScale,
                                height: val * sqrtScale,
                                x: dd.xy[0] - val * 0.5 * sqrtScale,
                                y: dd.xy[1] - val * 0.5 * sqrtScale,
                            },
                            style: {
                                opacity: op,
                            },
                        });
                    });
                },
            },
        });

        this.heatmapHref.update();
    };

    Chart.prototype.showTooltip = function (_) {
        showTooltipFunc = _;
        return this;
    };

    Chart.prototype.hideTooltip = function (_) {
        hideTooltipFunc = _;
        return this;
    };
    function getGradientImage() {
        var radialGrad = i2d.canvasLayer(null, {}, {});
        radialGrad.setPixelRatio(1);
        radialGrad.setSize(100, 100);

        var radialGradiant = radialGrad.createRadialGradient({
            innerCircle: { x: 50, y: 50, r: 0 },
            outerCircle: { x: 50, y: 50, r: 50 },
            mode: "percent",
            colorStops: [
                { color: "rgba(0, 0, 0, 1)", value: 0 },
                { color: "rgba(0, 0, 0, 0)", value: 100 },
            ],
        });

        radialGrad.createEl({
            el: "circle",
            attr: {
                r: 50,
                cx: 50,
                cy: 50,
            },
            style: {
                fillStyle: radialGradiant,
            },
        });
        radialGrad.execute();

        return radialGrad;
    }

    function gradientMapper(grad) {
        const arr = [];
        const gradLength = grad.length;
        const offSetsArray = [];

        grad.forEach(function (d) {
            arr.push(d.color[0] / 255);
            arr.push(d.color[1] / 255);
            arr.push(d.color[2] / 255);
            arr.push(d.color[3] === undefined ? 1.0 : d.color[3]);
            offSetsArray.push(d.offset);
        });
        return {
            value: new Float32Array(arr),
            length: gradLength,
            offset: new Float32Array(offSetsArray),
        };
    }

    function getDefaultFontSize(pa) {
        pa = document.body;
        var who = document.createElement("div");

        who.style.cssText =
            "display:inline-block; padding:0; line-height:1; position:absolute; visibility:hidden; font-size:1 rem";

        who.appendChild(document.createTextNode("M"));
        pa.appendChild(who);
        var fs = [who.offsetWidth, who.offsetHeight];
        pa.removeChild(who);
        return fs;
    }

    return new Chart();
}
