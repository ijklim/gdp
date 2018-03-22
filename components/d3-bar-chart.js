const WRAPPER = {
  width: 1100,
  height: 700,
  padding: 50,
  background: '#fff'
}

const CANVAS = {
  margin: {
    top: 20,
    right: 20,
    bottom: 25,
    left: 50
  }
}

const CHART = {
  width: WRAPPER.width - WRAPPER.padding * 2 - CANVAS.margin.right - CANVAS.margin.left,
  height: WRAPPER.height - WRAPPER.padding * 2 - CANVAS.margin.top - CANVAS.margin.bottom,
  background: '#FFF3E0',
  barColor: '#FFA726',
  barOffset: 0.2
}

Vue.component('d3-bar-chart', {
  template: `
    <div
      class="elevation-5 pt-4"
      :style="wrapperStyles"
    >
      <h2 class="mb-4">{{ appName }}</h2>
      <div :id="id" />
    </div>
  `,
  // svg cannot be property by itself, changes object type during assignment, within d3 object is fine
  data () {
    return {
      axis: {
        x: {},
        y: {}
      },
      d3: {},
      id: 'd3-' + Math.round(Math.random() * 1000000)
    }
  },
  props: {
    appName: {
      type: String,
      default: ''
    },
    d3Data: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    wrapperStyles () {
      return `height:${WRAPPER.height}px; width:${WRAPPER.width}px; margin:auto; background:${WRAPPER.background};`;
    }
  },
  watch: {
    /**
     * Data is now available to build structure of chart, e.g. xGuide, yGuide
     */
    d3Data () {
      // X axis
      this.axis.x.values = d3.scaleLinear()
                             .domain([d3.min(this.d3Data.x), d3.max(this.d3Data.x)])
                             .range([0, CHART.width]);
      // How far apart are the ticks on x axis, e.g. 7 days apart
      this.axis.x.ticks = d3.axisBottom(this.axis.x.values)
                            .ticks(10);
      // Setting first, last and gap between bars, note d3DataY is required
      this.axis.x.scale = d3.scaleBand()
                            .domain(this.d3Data.y)
                            .paddingInner(CHART.barOffset)
                            .paddingOuter(0)
                            .range([0, CHART.width]);
      // transform(x, y) specifies where x axis begins, drawn from left to right
      let xGuide = this.d3.svg.append('g')
                              .attr('transform', `translate(${CANVAS.margin.left}, ${CANVAS.margin.top + CHART.height})`)
                              .call(this.axis.x.ticks);
      

      // Y axis
      // .range specifies value from top left (high number) to bottom left (0)
      this.axis.y.values = d3.scaleLinear()
                             .domain([0, d3.max(this.d3Data.y)])
                             .range([CHART.height, 0]);
      // How many ticks are on the y axis
      this.axis.y.ticks = d3.axisLeft(this.axis.y.values)
                            .ticks(10);
      this.axis.y.scale = d3.scaleLinear()
                            .domain([0, d3.max(this.d3Data.y)])
                            .range([0, CHART.height]);
      // translate(x, y) specifies where y axis begins, drawn from top to bottom
      let yGuide = this.d3.svg.append('g')
                              .attr('transform', `translate(${CANVAS.margin.left}, ${CANVAS.margin.top})`)
                              .call(this.axis.y.ticks);

      this.draw();
    }
  },
  methods: {
    /**
     * Draw bars on chart
     */
    draw () {
      // translate(x, y) specifies where bar begins, +1 to move right of y axis
      this.d3.chart = this.d3.svg.append('g')
                                 .attr('transform', `translate(${CANVAS.margin.left + 1}, 0)`)
                                 .selectAll('rect')
                                 .data(this.d3Data.y)
                                 .enter()
                                 .append('rect');
      
      this.d3.chart
        .attr('fill', (data, index) => {
          return CHART.barColor
        })
        // .width sets width of bar
        .attr('width', _ => this.axis.x.scale.bandwidth())
        .attr('x', (data, index) => this.axis.x.scale(data))
        .attr('y', CHART.height + CANVAS.margin.top);
      
      // .delay sets speed of drawing
      this.d3.chart
        .transition()
        .delay((data, index) => index * 10)
        .duration(100)
        .ease(d3.easeCircleIn)
        .attr('y', data => CHART.height - this.axis.y.scale(data) + CANVAS.margin.top)
        .attr('height', data => this.axis.y.scale(data));
    }
  },
  mounted () {
    // Step #1: Select div to place d3 chart, set dimensions and color
    // Note: Code below must be in mounted(), created() does not work
    d3.select(`#${this.id}`)
      .append('svg')
        .attr('width', CHART.width + CANVAS.margin.right + CANVAS.margin.left)
        .attr('height', CHART.height + CANVAS.margin.top + CANVAS.margin.bottom)
        .style('background', CHART.background);
    this.d3.svg = d3.select(`#${this.id} svg`);
    // console.table(this.d3.svg)
  }
});