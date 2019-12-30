function optGetClass_(o) {
	var c = getPropertiesService_('document', 'json', 'class_version2');

	return c[o];
}


function optSetClass_(o, v) {
	if (o !== 'script' && o !== 'template') {
			console.error("optSetClass_(): Switch case is default", {o:o, v:v});
			return;
	}

	var c = getPropertiesService_('document', 'json', 'class_version2');

	c[o] = v;

	setPropertiesService_('document', 'json', 'class_version2', c);
}
