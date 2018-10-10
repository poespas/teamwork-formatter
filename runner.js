const fs = require('fs');
const moment = require('moment');
moment.locale('nl');
const jsonexport = require('jsonexport');


const input = './exportTimeLog.csv';


let exported = fs.readFileSync(input, 'utf-8');
    exported = exported.split('\r\n');

	weekNum = 1;
	
	let dates = [];

for (let i = 0; i < exported.length; i++) {
	let user = exported[i].split(`",`);
	
	user = user.map(function(e) {return e + '"'});

	//start and end
	if (i == 0 || user.length < 5)
		continue;

	let hours = parseFloat(JSON.parse(user[17]).replace(".","")) / 1000;

	let task = user[10].replace(/['"]+/g, '') + " ";
		task += (user[11].replace(/['"]+/g, '') != "" ? `( ${user[11].replace(/['"]+/g, '')} )` : "");
	
	if (task.length < 30)
		task += (user[9].replace(/['"]+/g, '') != "" ? `- ${user[9].replace(/['"]+/g, '')} ` : "");
	
	let info = {
		weekNum,
		datum: JSON.parse(user[1]),
		werkzaamheden: task,
		uren: hours.toString()
	};

	
	info.date = moment(info.date, "DD/MM/YYYY").format('L');
	dates.push(info);
}

let datums = {};
let out = [];
for (let i = 0; i < dates.length; i++) {
	const row = dates[i];

	if (!datums[row.datum]) {
		datums[row.datum] = {
			datums: row.datum,
			uren: parseFloat(row.uren),
			taken: row.werkzaamheden
		};
	}
	else {
		datums[row.datum].uren += parseFloat(row.uren);
		datums[row.datum].taken = datums[row.datum].taken + "\r\n" + row.werkzaamheden;
	}
}

for (const key in datums) {
	if (datums.hasOwnProperty(key)) {
		const row = datums[key];
		out.push(row);
	}
}

fs.writeFileSync("out.json", JSON.stringify(out));
toCsv(out, "./out.csv");

function toCsv(input, output) {
	jsonexport(input,{forceTextDelimiter: true},function(err, csv){
		if(err) return console.log(err);
		fs.writeFileSync(output, csv);
	});
}