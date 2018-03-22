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
    <div :id="id">
    </div>
  `,
  data () {
    return {
      d3Svg: false,
      d3Chart: false,
      id: 'd3-' + Math.round(Math.random() * 1000000),
      xAxis: {},
      yAxis: {},
    }
  },
  props: {
    d3DataX: {
      type: Array,
      default: () => []
    },
    d3DataY: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    
  },
  watch: {
    d3DataX () {
      this.xAxis.values = d3.scaleLinear()
                            .domain([d3.min(this.d3DataX), d3.max(this.d3DataX)])
                            .range([0, CHART_WIDTH]);
      // How far apart are the ticks on x axis, e.g. 7 days apart
      this.xAxis.ticks = d3.axisBottom(this.xAxis.values)
                           .ticks(10);
      // Setting first, last and gap between bars
      this.xAxis.scale = d3.scaleBand()
                           .domain(this.d3DataX)
                           .paddingInner(0.1)
                           .paddingOuter(0.1)
                           .range([0, CHART_WIDTH]);
      this.xAxis.ready = true;
      this.draw();
    },
    d3DataY () {
      // .range specifies value from top left (high number) to bottom left (0)
      this.yAxis.values = d3.scaleLinear()
                            .domain([0, d3.max(this.d3DataY)])
                            .range([CHART_HEIGHT, 0]);
      // How many ticks are on the y axis
      this.yAxis.ticks = d3.axisLeft(this.yAxis.values)
                           .ticks(10);
      this.yAxis.scale = d3.scaleLinear()
                           .domain([0, d3.max(this.d3DataY)])
                           .range([0, CHART_HEIGHT]);
      this.yAxis.ready = true;
      this.draw();
    }
  },
  methods: {
    draw () {
      if (!this.xAxis.ready) return;
      if (!this.yAxis.ready) return;
      if (!this.d3Svg) return;
      
      // translate(x, y) specifies where bar begins
      this.d3Chart = this.d3Svg.append('g')
                               .attr('transform', `translate(${CANVAS_MARGIN.left}, 0)`)
                               .selectAll('rect')
                               .data(this.d3DataY)
                               .enter()
                               .append('rect');
      // translate(x, y) specifies where y axis begins, drawn from top to bottom
      let yGuide = this.d3Svg.append('g')
                      .attr('transform', `translate(${CANVAS_MARGIN.left}, ${CANVAS_MARGIN.top})`)
                      .call(this.yAxis.ticks);
      // transform(x, y) specifies where x axis begins, drawn from left to right
      let xGuide = this.d3Svg.append('g')
                       .attr('transform', `translate(${CANVAS_MARGIN.left}, ${CANVAS_MARGIN.top + CHART_HEIGHT})`)
                       .call(this.xAxis.ticks);
      // console.log('toremove:')
      // console.table(this.d3Chart)
      
      this.d3Chart
          .attr('fill', (data, index) => {
            return BAR_COLOR
          })
          // .width sets width of bar
          .attr('width', data => this.xAxis.scale.bandwidth())
          .attr('x', (data, index) => {
            // console.log('toremove: this.xAxis.scale.bandwidth(): ', this.xAxis.scale.bandwidth())
            // console.log('toremove: this.xAxis.scale(data): ', this.xAxis.scale(data))
            return this.xAxis.scale(data)
          })
          .attr('y', CHART_HEIGHT + CANVAS_MARGIN.top);
      
      this.d3Chart
        .transition()
        .delay((data, index) => index * 20)
        .duration(10)
        .ease(d3.easeCircle)
        .attr('y', data => {
          return CHART_HEIGHT - this.yAxis.scale(data) + CANVAS_MARGIN.top;
        })
        .attr('height', data => {
          return this.yAxis.scale(data)
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
    this.d3Svg = d3.select(`#${this.id} svg`);
  }
});