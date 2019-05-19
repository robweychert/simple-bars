function activate(control) {
	if (control.hasAttribute('disabled')) {
		control.removeAttribute('disabled');
	} else {
		control.setAttribute('disabled', '');
	}
}

function slugify(text) {
	return text.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
}

function buildChart(e) {
	csv = document.getElementById('csv').value;
	rows = csv.split('\n');
	headers = rows[0].split(',');
	tableId = slugify(document.getElementById('chart-title').value);
	caption = '';
	captionText = document.getElementById('chart-title').value;
	captionId = 'caption-' + tableId;

	// Table CSS

	numericData = []
	for (row = 1; row < rows.length; row++) {
		currentRow = rows[row].split(',');
		for (col = 1; col < currentRow.length; col++) {
			numericData.push(currentRow[col]);
		}
	}
	highestNumber = numericData.slice().sort(function (a, b) { return a - b; }).reverse()[0];

	tableCSS = // Yeah, gotta find a better way to do this.
		'<style>\n'
		+ 'table.simplebars,\n'
		+ 'table.simplebars * {\n'
		+ '  border: 0;\n'
		+ '  box-sizing: border-box;\n'
		+ '  display: block;\n'
		+ '  font: inherit;\n'
		+ '  line-height: 1.2;\n'
		+ '  margin: 0;\n'
		+ '  padding: 0;\n'
		+ '  vertical-align: baseline;\n'
		+ '}\n'
		+ 'table.simplebars caption {\n'
		+ '  font-weight: bold;\n'
		+ '  margin-bottom: 0.75em;\n'
		+ '  text-align: left;\n'
		+ '}\n'
		+ 'table.simplebars thead {\n'
		+ '  display: none;\n'
		+ '}\n'
		+ 'table.simplebars .datapoint {\n'
		+ '  margin-bottom: 0.75em;\n'
		+ '}\n'
		+ 'table.simplebars .amount span {\n'
		+ '  color: red; /* customizable */\n'
		+ '  -moz-font-feature-settings:"tnum" 1;\n'
		+ '  -ms-font-feature-settings:"tnum" 1;\n'
		+ '  -o-font-feature-settings:"tnum" 1;\n'
		+ '  -webkit-font-feature-settings:"tnum" 1;\n'
		+ '  font-feature-settings:"tnum" 1;\n'
		+ '  overflow: visible;\n'
		+ '  padding-right: ' + (String(highestNumber).length + 1)
		+ 'ch; /* longest digit length + 1 */\n'
		+ '  vertical-align: middle;\n'
		+ '  white-space: nowrap;\n'
		+ '}\n'
		+ 'table.simplebars .amount span:before {\n'
		+ '  background: currentColor;\n'
		+ '  content: "";\n'
		+ '  display: inline-block;\n'
		+ '  height: 1em;\n'
		+ '  margin-right: 1ch;\n'
		+ '  vertical-align: -0.2em;\n'
		+ '}\n';
	if (headers.length > 2) {
		tableCSS +=
			'table.simplebars.multi {\n'
			+ '  border-bottom: 0.1em solid hsla(0,0%,60%,0.5);\n'
			+ '}\n'
			+ 'table.simplebars.multi .datapoint {\n'
			+ '  border-top: 0.1em solid hsla(0,0%,60%,0.5);\n'
			+ '}\n'
			+ 'table.simplebars.multi .label {\n'
			+ '  font-weight: bold;\n'
			+ '  margin: 0.75em 0;\n'
			+ '}\n'
			+ 'table.simplebars.multi .amount {\n'
			+ '  margin-bottom: 0.5em;\n'
			+ '}\n'
			+ 'table.simplebars.multi .amount:before {\n'
			+ '  content: attr(data-sublabel);\n'
			+ '}\n';
	}
	if (document.getElementById('responsive').checked) {
		tableCSS +=
			'@media screen and (min-width: ' + document.getElementById('breakpoint').value + 'em) { /* customizable */\n'
			+ '  table.simplebars.single .datapoint,\n'
			+ '  table.simplebars.multi .amount {\n'
			+ '    align-items: center;\n'
			+ '    display: grid;\n'
			+ '    grid-gap: 0.75em;\n'
			+ '    grid-template-columns: ' + document.getElementById('label-width').value + 'em 1fr; /* left column customizable */\n'
			+ '    margin-bottom: 0.5em;\n'
			+ '  }\n'
			+ '  table.simplebars caption {\n'
			+ '    text-align: center;\n'
			+ '  }\n'
			+ '  table.simplebars.single .label,\n'
			+ '  table.simplebars .amount:before {\n'
			+ '    text-align: right;\n'
			+ '  }\n';
		if (headers.length > 2) {
			tableCSS +=
				+ '  table.simplebars.multi .label {\n'
				+ '    margin-left: calc(' + document.getElementById('label-width').value + 'em + 0.75em);\n'
				+ '    margin-bottom: 0.5em;\n'
				+ '  }\n';
		}
		tableCSS += '}\n';
	}

	for (row = 1; row < rows.length; row++) {
		currentRow = rows[row].split(',');
		for (col = 1; col < currentRow.length; col++) {
			if (headers.length > 2) {
				tableCSS += 'table#' + tableId + ' .datapoint:nth-child(' + row + ') .amount:nth-child(' + (col + 1) + ') span:before { width: ' + ((currentRow[col] / highestNumber) * 100) + '%; }\n';
			} else {
				tableCSS += 'table#' + tableId + ' .datapoint:nth-child(' + row  + ') span:before { width: ' + ((currentRow[col] / highestNumber) * 100) + '%; }\n';
			}
		}
	}
	tableCSS += '</style>\n';

	// Table markup

	tableMarkup = '<table role="table" id="' + tableId + '" aria-describedby="' + captionId + '" class="simplebars';
	if (headers.length > 2) {
		tableMarkup += ' multi';
	} else {
		tableMarkup += ' single';
	}
	tableMarkup += '">\n'

	// Table caption

	if (captionText) {
		caption = '  <caption id="' + captionId + '">' + captionText + '</caption>\n';
	}

	// Table header

	headerMarkup = '  <thead role="rowgroup">\n    <tr role="row">\n';
	for (i = 0; i < headers.length; i++) {
		headerMarkup += '      <th role="columnheader">' + headers[i] + '</th>\n';
	}
	headerMarkup += '    </tr>\n  </thead>\n';

	// Table data

	dataMarkup = '  <tbody role="rowgroup">\n';
	for (row = 1; row < rows.length; row++) {
		currentRow = rows[row].split(',');
		dataMarkup += '    <tr role="row" class="datapoint">\n';
		for (col = 0; col < currentRow.length; col++) {
			dataMarkup += '      <td role="cell" class="';
			if (col == 0) {
				dataMarkup += 'label">';
			} else {
				dataMarkup += 'amount"';
				if (currentRow.length > 2) {
					dataMarkup += ' data-sublabel="' + headers[col] + '"';
				}
				dataMarkup += '><span>';
			}
			dataMarkup += currentRow[col];
			if (col != 0) {
				dataMarkup += '</span>';
			}
			dataMarkup += '</td>\n';
		}
		dataMarkup += '    </tr>\n';
	}
	dataMarkup += '  </tbody>\n';

	embedCode = tableCSS + tableMarkup + caption + headerMarkup + dataMarkup + '</table>';

	document.getElementById('output').innerHTML = embedCode;
	document.getElementById('preview').innerHTML = embedCode;
	e.preventDefault();
}

document.addEventListener('DOMContentLoaded', buildChart);
document.getElementById('responsive').addEventListener('click', function() { activate(document.getElementById('breakpoint')); activate(document.getElementById('label-width')) });
document.getElementById('captureButton').addEventListener('click', buildChart);