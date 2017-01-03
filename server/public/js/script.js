var socket = io();

socket.on('data', d => {
	humid_data.push(d[0]["humidity"]);
	temp_data.push(d[0]["temperature"]);
});

var n = 40,
temp_data = d3.range(n).map(() => { return 0 }),
humid_data = d3.range(n).map(() => { return 0 }); // Init data with zeroes

    var h_svg = d3.select("#humidity"),
    t_svg = d3.select("#temperature"),
    margin = {top: 20, right: 20, bottom: 20, left: 40},
    width = +h_svg.attr("width") - margin.left - margin.right,
    height = +h_svg.attr("height") - margin.top - margin.bottom,
    h_g = h_svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
    t_g = t_svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
    .domain([0, n - 1])
    .range([0, width]);

    var h_y = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);

    var t_y = d3.scaleLinear()
    .domain([-20, 110])
    .range([height, 0]);

    var h_line = d3.line()
    .x((d, i) => { return x(i) })
    .y((d, i) => { return h_y(d) });

    var t_line = d3.line()
    .x((d, i) => { return x(i) })
    .y((d, i) => { return t_y(d) })

    t_g.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

    t_g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + t_y(0) + ")")
    .call(d3.axisBottom(x));

    t_g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(t_y));

    t_g.append("g")
    .attr("clip-path", "url(#clip)")
    .append("path")
    .datum(temp_data)
    .attr("class", "line")
    .transition()
    .duration(10000)
    .ease(d3.easeLinear)
    .on("start", tick);



    h_g.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

    h_g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + h_y(0) + ")")
    .call(d3.axisBottom(x));

    h_g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(h_y));

    h_g.append("g")
    .attr("clip-path", "url(#clip)")
    .append("path")
    .datum(humid_data)
    .attr("class", "line")
    .transition()
    .duration(10000)
    .ease(d3.easeLinear)
    .on("start", tick);



    function tick() {

  // Push a new data point onto the back.
  // data.push(random());

  // Redraw the line.
  d3.select(this)
  .attr("d", h_line)
  .attr("transform", null);

  d3.select(this)
  .attr("d", t_line)
  .attr("transform", null);

  // Slide it to the left.
  d3.active(this)
  .attr("transform", "translate(" + x(-1) + ",0)")
  .transition()
  .on("start", tick);

  // Pop the old data point off the front.
  humid_data.shift();
  temp_data.shift();

}


