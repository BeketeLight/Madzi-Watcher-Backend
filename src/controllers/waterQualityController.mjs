import WaterQualityData from "../models/WaterQualityData.mjs";


/*
|--------------------------------------------------------------------------
| getDashboardStatistics
|--------------------------------------------------------------------------
| This controller provides a summary of the most important statistics
| for the admin dashboard.
|
| Expected operations:
| - Compute average (mean) values of key parameters (pH, TDS, turbidity,
|   electrical conductivity, WQI).
| - Compute standard deviation or variance for stability insight.
| - Retrieve latest readings.
| - Return insights such as safe ranges and water quality interpretation.
|
| Purpose:
| Allows the Qt dashboard to quickly display overall water system health.
*/
export const getDashboardStatistics = async (req, res, next) => {          
    try {
        const stats = await WaterQualityData.aggregate([
            {
                $group: {
                    _id: null,
                    // Mean values
                    meanPH: { $avg: "$pH" },
                    meanTDS: { $avg: "$tds" },
                    meanTurbidity: { $avg: "$turbidity" },
                    meanConductivity: { $avg: "$electricalConductivity" },
                    meanWQI: { $avg: "$waterQualityIndex" },
                    
                    // Standard deviation calculations
                    stdDevPH: { $stdDevPop: "$pH" },
                    stdDevTDS: { $stdDevPop: "$tds" },
                    stdDevTurbidity: { $stdDevPop: "$turbidity" },
                    stdDevConductivity: { $stdDevPop: "$electricalConductivity" },
                    stdDevWQI: { $stdDevPop: "$waterQualityIndex" },
                    
                    // Min values
                    minPH: { $min: "$pH" },
                    minTDS: { $min: "$tds" },
                    minTurbidity: { $min: "$turbidity" },
                    minConductivity: { $min: "$electricalConductivity" },
                    minWQI: { $min: "$waterQualityIndex" },
                    
                    // Max values
                    maxPH: { $max: "$pH" },
                    maxTDS: { $max: "$tds" },
                    maxTurbidity: { $max: "$turbidity" },
                    maxConductivity: { $max: "$electricalConductivity" },
                    maxWQI: { $max: "$waterQualityIndex" },
                    
                    // Count for WQI classification
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get latest reading
        const latestReading = await WaterQualityData.findOne()
            .sort({ createdAt: -1 })
            .limit(1);

        // Determine WQI classification
        let wqiClassification = "No Data";
        if (stats.length > 0) {
            const avgWQI = stats[0].meanWQI;
            if (avgWQI <= 50) wqiClassification = "Excellent";
            else if (avgWQI <= 100) wqiClassification = "Good";
            else if (avgWQI <= 200) wqiClassification = "Poor";
            else wqiClassification = "Unsafe";
        }

        // Format response
        const response = {
            mean: {
                pH: stats[0]?.meanPH || null,
                tds: stats[0]?.meanTDS || null,
                turbidity: stats[0]?.meanTurbidity || null,
                electricalConductivity: stats[0]?.meanConductivity || null,
                wqi: stats[0]?.meanWQI || null
            },
            stdDev: {
                pH: stats[0]?.stdDevPH || null,
                tds: stats[0]?.stdDevTDS || null,
                turbidity: stats[0]?.stdDevTurbidity || null,
                electricalConductivity: stats[0]?.stdDevConductivity || null,
                wqi: stats[0]?.stdDevWQI || null
            },
            min: {
                pH: stats[0]?.minPH || null,
                tds: stats[0]?.minTDS || null,
                turbidity: stats[0]?.minTurbidity || null,
                electricalConductivity: stats[0]?.minConductivity || null,
                wqi: stats[0]?.minWQI || null
            },
            max: {
                pH: stats[0]?.maxPH || null,
                tds: stats[0]?.maxTDS || null,
                turbidity: stats[0]?.maxTurbidity || null,
                electricalConductivity: stats[0]?.maxConductivity || null,
                wqi: stats[0]?.maxWQI || null
            },
            latestReading: latestReading || null,
            wqiClassification: wqiClassification,
            totalReadings: stats[0]?.count || 0
        };

        return res.status(200).json({
            status: "success",
            message: "Dashboard statistics retrieved successfully",
            data: response
        });
    }                                               
    catch (error) {
        next(error);
    }                       
} 


/*
|--------------------------------------------------------------------------
| getWaterQualityHistory
|--------------------------------------------------------------------------
| Returns historical water quality data collected by the ESP32 sensors.
|
| Expected operations:
| - Retrieve all stored sensor records from MongoDB.
| - Return time-series data containing pH, TDS, turbidity,
|   electrical conductivity, and WQI.
|
| Purpose:
| Allows administrators to view the full history of water quality
| measurements for analysis and visualization (graphs, charts).
*/
export const getWaterQualityHistory = async (req, res, next) => {
    try {
        const { limit = 100, skip = 0, startDate, endDate } = req.query;

        let query = {};

        // Add date range filtering if provided
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const history = await WaterQualityData.find(query)
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .lean();

        const totalCount = await WaterQualityData.countDocuments(query);

        if (history.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "No water quality history found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Water quality history data retrieved successfully",
            data: {
                readings: history,
                pagination: {
                    total: totalCount,
                    limit: parseInt(limit),
                    skip: parseInt(skip),
                    hasMore: totalCount > (parseInt(skip) + history.length)
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
}


