String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.dequote = function() {
  return this.replace(/^"|"$/g, '');
}

String.prototype.decopify = function() {
  var text = this.dequote();

  text = text.replace(/ \/ /, ' at ');
  text = text.replace(/^(\w+\d+ \w) at \1/i, '$1 at');

  text = text.replace(/\bJNO\b/i, 'just north of');
  text = text.replace(/\bJSO\b/i, 'just south of');
  text = text.replace(/\bJEO\b/i, 'just east of');
  text = text.replace(/\bJWO\b/i, 'just west of');

  text = text.replace(/\bNB*\b/i, 'north bound');
  text = text.replace(/\bSB*\b/i, 'south bound');
  text = text.replace(/\bEB*\b/i, 'east bound');
  text = text.replace(/\bWB*\b/i, 'west bound');

  text = text.replace(/\bOFR\b/ig, 'offramp');
  text = text.replace(/\bONR\b/ig, 'onramp');
  text = text.replace(/\bCON\b/i, 'connector');

  text = text.replace(/\bAT\b/i, 'at');
  text = text.replace(/\bON\b/i, 'on');
  text = text.replace(/\bTO\b/i, 'to');

  text = text.replace(/\bSR51\b/i, 'CAP CITY FWY');

  text = text.replace(/\bTrfc\b/i, 'Traffic');
  text = text.replace(/\bInj\b/i, 'Injury');
  text = text.replace(/\bEnrt\b/i, 'Enroute');
  text = text.replace(/\bVeh\b/ig, 'Vehicle');
  text = text.replace(/\bVehs\b/ig, 'Vehicles');
  text = text.replace(/\bUnk(n*)\b/i, 'Unknown');
  text = text.replace(/\b1141\b/, 'Ambulance');
  text = text.replace(/\bRP\b/i, 'reporting party');
  text = text.replace(/\bTC\b/i, 'collision');
  text = text.replace(/\bRHS\b/i, 'right hand side');
  text = text.replace(/\bLHS\b/i, 'left hand side');
  text = text.replace(/\bMDL\b/ig, 'middle');
  text = text.replace(/\bRDWY\b/ig, 'roadway');
  text = text.replace(/\bINVLD\b/i, 'involved');
  text = text.replace(/\bCT\b/ig, 'CalTrans');

  text = text.replace(/^FIRE-Report of$/, 'Report of Fire');
  text = text.replace(/Collision-(\w+)/, 'Collision - $1');
  text = text.replace(/Traffic Collision/, 'Collision');

  text = text.replace(/\s*\/\//, '. ');
  text = text.replace(/(\d{3})-\d{3}-\d{4}/, '$1-***-****');
  text = text.replace(/^(\[\d+\] )+/, '');
  text = text.replace(/^0 /, '');

  return text;
}
