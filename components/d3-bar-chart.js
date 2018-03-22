const CANVAS_MARGIN = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 50
};
const CHART_WIDTH = 1000 - CANVAS_MARGIN.right - CANVAS_MARGIN.left;
const CHART_HEIGHT = 600 - CANVAS_MARGIN.top - CANVAS_MARGIN.bottom;
const CHART_COLOR = '#efe';
const BAR_COLOR = '#9c9';
const BAR_WIDTH = 20;
const BAR_OFFSET = 5;

Vue.component('d3-bar-chart', {
  template: `
    <div
      class="elevation-5 pt-5"
      style="height:700px; width:1100px; margin:auto;"
      :id="id"
    />
  `,
  // svg cannot be property by itself, changes object type during assignment, within d3 object is fine
  data () {
    return {
      d3: {},
      id: 'd3-' + Math.round(Math.random() * 1000000),
      axis: {
        x: {},
        y: {}
      }
    }
  },
  props: {
    d3Data: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    
  },
  watch: {
    /**
     * Data is now available to build structure of chart, e.g. xGuide, yGuide
     */
    d3Data () {
      // X axis
      this.axis.x.values = d3.scaleLinear()
                            .domain([d3.min(this.d3Data.x), d3.max(this.d3Data.x)])
                            .range([0, CHART_WIDTH]);
      // How far apart are the ticks on x axis, e.g. 7 days apart
      this.axis.x.ticks = d3.axisBottom(this.axis.x.values)
                           .ticks(10);
      // Setting first, last and gap between bars, note d3DataY is required
      this.axis.x.scale = d3.scaleBand()
                           .domain(this.d3Data.y)
                           .paddingInner(0)
                           .paddingOuter(0)
                           .range([0, CHART_WIDTH]);
      // transform(x, y) specifies where x axis begins, drawn from left to right
      let xGuide = this.d3.svg.append('g')
                       .attr('transform', `translate(${CANVAS_MARGIN.left}, ${CANVAS_MARGIN.top + CHART_HEIGHT})`)
                       .call(this.axis.x.ticks);
      

      // Y axis
      // .range specifies value from top left (high number) to bottom left (0)
      this.axis.y.values = d3.scaleLinear()
      .domain([0, d3.max(this.d3Data.y)])
      .range([CHART_HEIGHT, 0]);
      // How many ticks are on the y axis
      this.axis.y.ticks = d3.axisLeft(this.axis.y.values)
      .ticks(10);
      this.axis.y.scale = d3.scaleLinear()
      .domain([0, d3.max(this.d3Data.y)])
      .range([0, CHART_HEIGHT]);
      // translate(x, y) specifies where y axis begins, drawn from top to bottom
      let yGuide = this.d3.svg.append('g')
      .attr('transform', `translate(${CANVAS_MARGIN.left}, ${CANVAS_MARGIN.top})`)
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
                               .attr('transform', `translate(${CANVAS_MARGIN.left + 1}, 0)`)
                               .selectAll('rect')
                               .data(this.d3Data.y)
                               .enter()
                               .append('rect');
      
      this.d3.chart
          .attr('fill', (data, index) => {
            return BAR_COLOR
          })
          // .width sets width of bar
          .attr('width', data => this.axis.x.scale.bandwidth())
          .attr('x', (data, index) => this.axis.x.scale(data))
          .attr('y', CHART_HEIGHT + CANVAS_MARGIN.top);
      
      // .delay sets speed of drawing
      this.d3.chart
        .transition()
        .delay((data, index) => index * 10)
        .duration(100)
        .ease(d3.easeCircleIn)
        .attr('y', data => {
          return CHART_HEIGHT - this.axis.y.scale(data) + CANVAS_MARGIN.top;
        })
        .attr('height', data => {
          return this.axis.y.scale(data)
        });
    }
  },
  mounted () {
    // Step #1: Select div to place d3 chart, set dimensions and color
    // Note: Code below must be in mounted(), created() does not work
    d3.select(`#${this.id}`)
      .append('svg')
        .attr('width', CHART_WIDTH + CANVAS_MARGIN.right + CANVAS_MARGIN.left)
        .attr('height', CHART_HEIGHT + CANVAS_MARGIN.top + CANVAS_MARGIN.bottom)
        .style('background', CHART_COLOR);
    this.d3.svg = d3.select(`#${this.id} svg`);
    // console.table(this.d3.svg)
  }
});