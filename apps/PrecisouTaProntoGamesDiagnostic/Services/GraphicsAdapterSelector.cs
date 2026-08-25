using System;
using System.Collections.Generic;
using System.Linq;
using PrecisouTaProntoGamesDiagnostic.Models;

namespace PrecisouTaProntoGamesDiagnostic.Services;

public static class GraphicsAdapterSelector
{
    public static GraphicsAdapter? SelectBest(IEnumerable<GraphicsAdapter> adapters) =>
        adapters
            .Where(adapter => !string.IsNullOrWhiteSpace(adapter.Name))
            .OrderByDescending(EstimateCapability)
            .ThenByDescending(adapter => adapter.VideoMemoryGb)
            .FirstOrDefault();

    public static int EstimateCapability(GraphicsAdapter adapter)
    {
        var name = adapter.Name.ToLowerInvariant();
        var family =
            name.Contains("rtx 50") ? 110 :
            name.Contains("rtx 40") || name.Contains("rx 7") ? 100 :
            name.Contains("rtx 30") || name.Contains("rx 6") ? 85 :
            name.Contains("rtx 20") || name.Contains("gtx 16") ? 70 :
            name.Contains("gtx 10") || name.Contains("rx 5") ? 56 :
            name.Contains("arc") ? 52 :
            name.Contains("iris") || name.Contains("vega") || name.Contains("radeon graphics") ? 40 :
            name.Contains("intel") ? 28 : 35;
        return family + (int)Math.Min(Math.Max(adapter.VideoMemoryGb, 0), 16);
    }

    public static bool IsIntegrated(string name)
    {
        var value = name.ToLowerInvariant();
        return value.Contains("intel") || value.Contains("iris") ||
               value.Contains("uhd") || value.Contains("vega") ||
               value.Contains("radeon graphics");
    }
}
