"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.latestEnterpriseTierKubernetesVersion = exports.latestStandardTierKubernetesVersion = exports.latestKubernetesVersion = exports.enterpriseKubernetesVersions = exports.kubernetesVersions = void 0;
var lke_1 = require("support/util/lke");
/**
 * Kubernetes versions available for cluster creation via Cloud Manager.
 */
exports.kubernetesVersions = ['1.31', '1.30'];
/**
 * Enterprise kubernetes versions available for cluster creation via Cloud Manager.
 */
exports.enterpriseKubernetesVersions = ['v1.31.1+lke1'];
/**
 * The latest Kubernetes version available for cluster creation via Cloud Manager.
 */
exports.latestKubernetesVersion = (0, lke_1.getLatestKubernetesVersion)(exports.kubernetesVersions);
/**
 * The latest standard tier Kubernetes version available for cluster creation via Cloud Manager.
 */
exports.latestStandardTierKubernetesVersion = {
    id: exports.latestKubernetesVersion,
    tier: 'standard',
};
/**
 * The latest enterprise tier Kubernetes version available for cluster creation via Cloud Manager.
 */
exports.latestEnterpriseTierKubernetesVersion = {
    id: (0, lke_1.getLatestKubernetesVersion)(exports.enterpriseKubernetesVersions),
    tier: 'enterprise',
};
