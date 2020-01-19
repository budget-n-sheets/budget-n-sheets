function optGetClass_(a) {
	if (typeof a != "string") return;

	var b = getPropertiesService_("document", "json", "class_version");

	if (!b) return;

	return b[a];
}

function optSetClass_(a, b) {
	if (typeof a != "string") return;

	var c = getPropertiesService_("document", "json", "class_version");

	if (!c) c = { };

	switch (a) {
		case "AddonVersion":
		case "AddonVersionName":
		case "TemplateVersion":
		case "TemplateVersionName":
			c[a] = b;
			break;

		default:
			console.error("optSetClass_(): Switch case is default", {a:a, b:b});
			break;
	}

	setPropertiesService_("document", "json", "class_version", c);
}


function optGetClass2_(o) {
	var c = getPropertiesService_('document', 'json', 'class_version2');

	return c[o];
}

function optSetClass2_(o, v) {
	if (o !== 'script' && o !== 'template') {
			console.error("optSetClass_(): Switch case is default", {o:o, v:v});
			return;
	}

	var c = getPropertiesService_('document', 'json', 'class_version2');

	c[o] = v;

	setPropertiesService_('document', 'json', 'class_version2', c);
}
