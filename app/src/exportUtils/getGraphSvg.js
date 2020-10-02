import {
    mxConstants
} from "mxgraph-js";

import { getSvgBase } from "./getSvgBase";
import { isCssFontUrl, getCustomFonts } from "./fonts";

export const getSvg = (graph, background, scale, border, nocrop, crisp,
    ignoreSelection, showText, imgExport, linkTarget, hasShadow, incExtFonts, keepTheme) => 
{
    var temp = null;
    
    if (!keepTheme && graph.themes != null && graph.defaultThemeName == 'darkTheme')
    {
        temp = graph.stylesheet;
        graph.stylesheet = graph.getDefaultStylesheet();
        // LATER: Fix math export in dark mode by fetching text nodes before
        // calling refresh and changing the font color in-place
        graph.refresh();
    }
    
    var result = getSvgBase(graph, background, scale, border, nocrop, crisp,
        ignoreSelection, showText, imgExport, linkTarget, hasShadow, incExtFonts, keepTheme);
    var extFonts = getCustomFonts();
    
    // Adds external fonts
    if (incExtFonts && extFonts.length > 0)
    {
        var svgDoc = result.ownerDocument;
        var style = (svgDoc.createElementNS != null) ?
            svgDoc.createElementNS(mxConstants.NS_SVG, 'style') : svgDoc.createElement('style');
        svgDoc.setAttributeNS != null? style.setAttributeNS('type', 'text/css') : style.setAttribute('type', 'text/css');
        
        var prefix = '';
        var postfix = '';
                
        for (var i = 0; i < extFonts.length; i++)
        {
            var fontName = extFonts[i].name, fontUrl = extFonts[i].url;
            
            if (isCssFontUrl(fontUrl))
            {
                prefix += '@import url(' + fontUrl + ');\n';
            }
            else
            {
                postfix += '@font-face {\n' +
                    'font-family: "' + fontName + '";\n' + 
                    'src: url("' + fontUrl + '");\n}\n';
            }				
        }
        
        style.appendChild(svgDoc.createTextNode(prefix + postfix));
        result.getElementsByTagName('defs')[0].appendChild(style);
    }
    
    if (temp != null)
    {
        graph.stylesheet = temp;
        graph.refresh();
    }
    
    return result;
};