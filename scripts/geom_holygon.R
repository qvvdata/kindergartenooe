library(ggplot2)
library(proto)
library(grid)

GeomHolygon <- ggproto(
  "GeomHolygon", 
  GeomPolygon,
  extra_params = c("na.rm", "rule"),
  draw_panel = function(data, scales, coordinates, rule) {
    n <- nrow(data)
    if (n == 1) 
      return(zeroGrob())
    
    munched <- coord_munch(coordinates, data, scales)
    munched <- munched[order(munched$group), ]
    
    first_idx <- !duplicated(munched$group)
    first_rows <- munched[first_idx, ]
    
    ggplot2:::ggname(
      "geom_holygon", 
      pathGrob(munched$x, munched$y, default.units = "native", 
               id = munched$group, rule = rule, 
               gp = gpar(col = first_rows$colour, 
                         fill = alpha(first_rows$fill, first_rows$alpha), 
                         lwd = first_rows$size * .pt, 
                         lty = first_rows$linetype)))
  }
)

geom_holygon <- function (mapping = NULL, data = NULL, stat = "identity", position = "identity", 
                          na.rm = FALSE, show.legend = NA, inherit.aes = TRUE, rule = "winding", ...) {
  ggplot2::layer(data = data, mapping = mapping, stat = stat, geom = GeomHolygon, 
                 position = position, show.legend = show.legend, inherit.aes = inherit.aes, 
                 params = list(na.rm = na.rm , rule = rule, ...))
}