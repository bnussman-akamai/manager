"use strict";
/**
 * A map to associate cloud pulse service types with their corresponding labels.
 * Used for mapping service type identifiers (e.g., 'linode', 'dbaas') to their display labels.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.POLLING_INTERVAL_DESCRIPTION = exports.EVALUATION_PERIOD_DESCRIPTION = exports.SEVERITY_LEVEL_DESCRIPTION = exports.METRIC_DESCRIPTION_DATA_FIELD = exports.cloudPulseServiceMap = void 0;
exports.cloudPulseServiceMap = {
    dbaas: 'Databases',
    linode: 'Linode',
};
/**
 * Descriptions used in the Create/Edit Alert form to guide users
 * in configuring alert conditions effectively.
 */
exports.METRIC_DESCRIPTION_DATA_FIELD = 'Represents the metric you want to receive alerts for. Choose the one that helps you evaluate performance of your service in the most efficient way. For multiple metrics we use the AND method by default.';
/**
 * Defines a severity level associated with the alert
 * to help prioritize and manage alerts in the Recent Activity tab.
 */
exports.SEVERITY_LEVEL_DESCRIPTION = 'Define a severity level associated with the alert to help you prioritize and manage alerts in the Recent activity tab.';
/**
 * Defines the timeframe for collecting data in polling intervals
 * to understand service performance.
 * Determines the data lookback period where thresholds are applied.
 */
exports.EVALUATION_PERIOD_DESCRIPTION = 'Defines the timeframe for collecting data in polling intervals to understand the service performance. Choose the data lookback period where the thresholds are applied to gather the information impactful for your business.';
/**
 * Specifies how often the alert condition should be evaluated.
 */
exports.POLLING_INTERVAL_DESCRIPTION = 'Choose how often you intend to evaluate the alert condition.';
