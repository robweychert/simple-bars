// Slugify a string
// https://lucidar.me/en/web-dev/how-to-slugify-a-string-in-javascript/
function slugify(str) {
  str = str.replace(/^\s+|\s+$/g, '');
  // Make the string lowercase
  str = str.toLowerCase();
  // Remove accents, swap ñ for n, etc
  let from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;";
  let to   = "AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------";
  for (let i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }
  // Remove invalid chars
  str = str.replace(/[^a-z0-9 -]/g, '') 
  // Collapse whitespace and replace by -
  .replace(/\s+/g, '-') 
  // Collapse dashes
  .replace(/-+/g, '-'); 

  return str;
}

function buildChart(e) {
	const csv = document.getElementById('chart-csv').value;
	const rows = csv.split('\n');
	const headers = rows[0].split(',');
	const title = document.getElementById('chart-title').value;
	const description = document.getElementById('chart-description').value;
	let caption = '';
	let captionId = '';
	let tableId = '';
	if (title) {
		tableId = slugify(title);
		captionId = 'caption-' + tableId;
	} else if (description) {
		tableId = slugify(description);
		captionId = 'caption-' + tableId;
	}

	let chartStyle = '';
	let numericData = []
	let pos = 0;
	let neg = 0;
	let min = 0;
	let max = 0;
	let minChars = 0;
	let maxChars = 0;
	for (let row = 1; row < rows.length; row++) {
		let currentRow = rows[row].split(',');
		for (let col = 1; col < currentRow.length; col++) {
			let amount = Number(currentRow[col]);
			if (typeof(amount) === 'number') {
				numericData.push(amount);
				if (amount >= 0) {
					pos += 1;
				} else {
					neg += 1;
				}
			}
		}
	}
	numericData.sort(function (a, b) { return a - b; });
	if (pos >= 0 && neg === 0) {
		chartStyle = ' sb-allpos';
		min = 0;
		max = numericData[numericData.length - 1];
		minChars = 0;
		maxChars = String(max).length + 1;
	} else if (pos === 0 && neg >= 0) {
		chartStyle = ' sb-allneg';
		min = numericData[0];
		max = 0;
		minChars = String(min).length + 1;
		maxChars = 0;
	} else if (pos >= 0 && neg >= 0) {
		chartStyle = ' sb-posneg';
		min = numericData[0];
		max = numericData[numericData.length - 1];
		minChars = String(min).length + 1;
		maxChars = String(max).length + 1;
	}
	
	console.log('chartStyle: ' + chartStyle);
	console.log('numericData: ' + numericData);
	console.log('pos: ' + pos);
	console.log('neg: ' + neg);
	console.log('min: ' + min);
	console.log('max: ' + max);
	console.log('minChars: ' + minChars);
	console.log('maxChars: ' + maxChars);

	let tableMarkup = '<table role="table"';
	if (tableId) {
		tableMarkup += ' id="' + tableId + '"';
	}
	if (captionId) {
		tableMarkup += ' aria-describedby="' + captionId + '"'; // Add slugified title or description
		caption = '<caption id="' + captionId + '" class="sb-caption">'; // Add slugified title or description
		if (title) {
			caption += '<p class="sb-title"><strong>' + title + '</strong></p>';
		}
		if (description) {
			caption += '<p class="sb-description">' + description + '</p>';
		}
		caption += '</caption>';
	}
	tableMarkup += ' class="simplebars' + chartStyle + '" style="--abs-min:' + Math.abs(min) + ';--abs-max:' + max + ';--min-chars:' + minChars + 'ch;--max-chars:' + maxChars + 'ch;">';
	// Add colors
	tableMarkup += caption;
	if (headers) {
		tableMarkup += '<thead role="rowgroup" class="sb-legend"><tr role="row" class="sb-legend-items">';
		for (let header = 0; header < headers.length; header++) {
			tableMarkup += '<th role="columnheader" class="sb-legend-item">' + headers[header] + '</th>';
		}
		tableMarkup += '</tr></thead>';
	}
	if (rows) {
		tableMarkup += '<tbody role="rowgroup" class="sb-data">';
		for (let row = 1; row < rows.length; row++) {
			let currentRow = rows[row].split(',');
			tableMarkup += '<tr role="row" class="sb-datum">';
			for (let col = 0; col < currentRow.length; col++) {
				let cellType = 'sb-amount';
				let amountType = '';
				let style = ''
				if (col === 0) {
					cellType = 'sb-label';
				} else {
					style = ' style="--abs-val:' + Math.abs(currentRow[col]) + '"';
				}
				if (col > 0) {
					if (currentRow[col] >= 0) {
						amountType = ' sb-pos';
					} else {
						amountType = ' sb-neg';
					}
				}
				tableMarkup += '<td role="cell" class="' + cellType + amountType + '"' + style + '>' + currentRow[col] + '</td>';
			}
			tableMarkup += '</tr>';
		}
		tableMarkup += '</tbody>';
	}
	tableMarkup += '</table>';
	document.getElementById('output').innerHTML = tableMarkup;
	e.preventDefault();
}
document.getElementById('generateEmbed').addEventListener('click', buildChart);