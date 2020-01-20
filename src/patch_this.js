/**
 * Patch This: A basic patching system
 * Copyright (C) 2020 Guilherme T Maeoka
 * <https://github.com/guimspace/patch-this>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

function update_() {
	if (!getPropertiesService_('document', '', 'is_installed')) return 3;

	var lock = LockService.getDocumentLock();
	try {
		lock.waitLock(200);
	} catch (err) {
		console.warn("update_ExecutePatial_(): Wait lock time out.");
		return 1;
	}

	const v0 = optGetClass_('script');
	const v1 = AppsScriptGlobal.script_version()["number"];

	if (v0.major > v1.major) return 0;
	if (v0.major == v1.major) {
		if (v0.minor > v1.minor) return 0;
		else if (v0.minor == v1.minor && v0.patch >= v1.patch) return 0;
	}

	var ver, major, minor, patch;
	var mm, pp, r, t;

	major = v0.major;
	minor = v0.minor;
	patch = v0.patch;
	list = AppsScriptGlobal.patch_list();

	t = 0;
	mm = minor;
	pp = patch;
	r = {r:0, m:minor, p:patch};

	do {
		ver = (major == v1.major ? v1 : null);
		if (major >= list.length) {
			major -= 2;
			t = 1;
		} else if (list[major]) {
			r = update_major_(ver, list[major], minor, patch);
		}

		if (r.r || major == v1.major) {
			t = 1;
		} else {
			major++;
			mm = r.m;
			minor = 0;
			pp = r.p;
			patch = -1;
		}
	} while (!t);

	if (r.r) {
		if (r.m == -1) {
			major--;
			r.m = mm;
		}
		if (r.p == -1) r.p = pp;

		console.info("add-on/update/fail", r);
	} else {
		console.info("add-on/update/success");
	}

	var cell = {
		major: major,
		minor: r.m,
		patch: r.p
	};

	optSetClass_('script', cell);
	nodeControl_('sign');

	return 0;
}


function update_major_(v1, list, minor, patch) {
	var m = minor;
	var p = patch;
	var ver, pp, r, t;

	t = 0;
	pp = p;
	r = {r:0, p:p};

	do {
		if (v1 && m == v1.minor) ver = v1;
		else ver = null;

		if (m >= list.length) {
			m -= 2;
			t = 1;
		} else if (list[m]) {
			r = update_minor_(ver, list[m], p);
		}

		if (r.r || (ver && m == ver.minor)) {
			t = 1;
		} else {
			m++;
			pp = r.p;
			p = -1;
		}
	} while (!t);

	if (r.r && r.p == -1) {
		m--;
		r.p = pp;
	}

	p = r.p;
	r = r.r;

	return {r:r, m:m, p:p};
}


function update_minor_(v1, list, patch) {
	var p = patch;
	var ver, r;

	r = 0;

	if (v1) ver = v1;
	else ver = {patch:-100};

	do {
		p++;
		if (p >= list.length) {
			p--;
			break;
		} else if (list[p]) {
			r = list[p]();
		}
	} while (!r && p != ver.patch);

	if (r) p--;

	return {r:r, p:p};
}
