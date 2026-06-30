# AVe

Houses application-specific viewer components for use within the Mat3ra workflow ecosystem.
See the README documentation for `CoVe` for best practices when developing viewer component libraries.

In addition to entities defined in `ADe`, `AVe` implements the `ExecutionUnit` and `ExecutionUnitViewer`
components, since they are intimately related. This means that `AVe` depends not only on `ADe`, but `WoDe`
as well. This is acceptable since the viewer component libraries may assume any number of entity definition
libraries as dependencies with no issues.
