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
	const v1 = APPS_SCRIPT_GLOBAL_.script_version.number;

	if (v0.major > v1.major) return;
	if (v0.major == v1.major) {
		if (v0.minor > v1.minor) return;
		if (v0.minor == v1.minor) {
			if (v0.patch > v1.patch) return;
			if (v0.patch == v1.patch) {
				if (PATCH_THIS_["beta_list"].length == 0 || v0.beta >= PATCH_THIS_["beta_list"].length) return;
			}
		}
	}

	var ver, major, minor, patch;
	var mm, pp, r, t;

	const beta = v0.beta == null ? 0 : v0.beta;
	const patch_list = PATCH_THIS_.patch_list;

	major = v0.major;
	minor = v0.minor;
	patch = v0.patch;

	t = 0;
	mm = minor;
	pp = patch;
	r = {r:0, m:minor, p:patch, b:beta};

	do {
		ver = (major == v1.major ? v1 : null);
		if (major >= patch_list.length) {
			major -= 2;
			t = 1;
		} else if (patch_list[major]) {
			r = update_major_(ver, patch_list[major], minor, patch, beta);
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
		if (r.m == -1) r.m = 0;
	}

	var cell = {
		major: major,
		minor: r.m,
		patch: r.p,
		beta: r.b
	};

	optSetClass_('script', cell);
	nodeControl_('sign');

	return 0;
}


function update_major_(v1, list, minor, patch, beta) {
	if (list == null || list.length == 0) return {r:1, m:-1, p:-1};

	var m = minor;
	var p = patch;
	var ver, pp, b, r, t;

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
			r = update_minor_(ver, list[m], p, beta);
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
	} else if (r.p == -1) {
		r.p = 0;
	}

	p = r.p;
	b = r.b;
	r = r.r;

	return {r:r, m:m, p:p, b:b};
}


function update_minor_(v1, list, patch, beta) {
	if (list == null || list.length == 0) return {r:1, p:-1, b:0};

	var p = patch;
	var ver, b, r;

	r = 0;

	if (v1) ver = v1;
	else ver = {patch:-100};

	if (p != ver.patch) b = 0;
	else b = beta;

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

	if (p == ver.patch) {
		b = update_beta_(b);
	}

	return {r:r, p:p, b:b};
}


function update_beta_(beta) {
	var list = PATCH_THIS_["beta_list"];
	var b = beta;

	while (b < list.length) {
		if (list[b]) {
			list[b]();
		}
		b++;
	}

	return b;
}
