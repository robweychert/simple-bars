function buildChart(e) {
	const csv = document.getElementById('chart-csv').value;
	const rows = csv.split('\n');
	const headers = rows[0].split(',');
	const title = document.getElementById('chart-title').value;
	const description = document.getElementById('chart-description').value;
	let caption = '';
	const numericData = []
	for (let row = 1; row < rows.length; row++) {
		let currentRow = rows[row].split(',');
		for (let col = 1; col < currentRow.length; col++) {
			numericData.push(currentRow[col]);
		}
	}
	let tableMarkup = '<table role="table"';
	if (title || description) {
		tableMarkup += ' aria-describedby="caption"' // Add slugified title or description
		caption = '<caption class="sb-caption">'; // Add slugified title or description
		if (title) {
			caption += '<p class="sb-title"><strong>' + title + '</strong></p>';
		}
		if (description) {
			caption += '<p class="sb-desc">' + description + '</p>';
		}
		caption += '</caption>';
	}
	tableMarkup += ' class="simplebars">'; // Add allpos, allneg, or posneg
	// Add id
	// Add style
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
				let cellType = 'sb-amt';
				let amtType = '';
				let style = ''
				if (col === 0) {
					cellType = 'sb-lbl';
				} else {
					style = ' style="--abs-val:' + Math.abs(currentRow[col]) + '"';
				}
				if (col > 0) {
					if (currentRow[col] >= 0) {
						amtType = ' sb-pos';
					} else {
						amtType = ' sb-neg';
					}
				}
				tableMarkup += '<td role="cell" class="' + cellType + amtType + '"' + style + '>' + currentRow[col] + '</td>';
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