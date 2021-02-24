import React from "react"

import { connect } from "react-redux"

import get from "lodash.get"

import { getUsers } from "@availabs/ams"

import { useAsyncSafe } from "avl-components"

const shortUploaded = Component => {
  const Wrapper = ({ falcor, falcorCache, getUsers, users, ...props }) => {

    const [loading, _setLoading] = React.useState(false),
      setLoading = useAsyncSafe(_setLoading)

    React.useEffect(() => {

      setLoading(true);

      getUsers();
      falcor.get(["tds", "meta", "upload", "length"])
        .then(res => {
          const length = get(res, ["json", "tds", "meta", "upload", "length"], 0);
          if (length) {
            return falcor.get([
              "tds", "meta", "upload", "byIndex", { from: 0, to: length - 1 },
              ["created_by", "created_at", "status", "meta"]
            ])
          }
        })
        .then(() => setLoading(false));
    }, [getUsers, falcor, setLoading]);

    const uploads = React.useMemo(() => {
      const uploads = [];
      const length = +get(falcorCache, ["tds", "meta", "upload", "length"], 0);
      if (length) {
        for (let i = 0; i < length; ++i) {
          const ref = get(falcorCache, ["tds", "meta", "upload", "byIndex", i, "value"]),
            upload = get(falcorCache, ref, null);
          if (upload) {
            uploads.push({
              ...upload,
              meta: get(upload, ["meta", "value"], null),
              created_by: users.reduce((a, c) => {
                return `${ c.id }` === `${ upload.created_by }` ? `(${ c.id }) ${ c.email }` : a;
              }, upload.created_by)
            })
          }
        }
      }
      return uploads;
    }, [falcorCache, users]);

    return (
      <Component { ...props } uploads={ uploads } users={ users }
        loading={ loading }/>
    )
  }
  const mapStateToProps = state => ({
    users: state.users
  });
  return connect(mapStateToProps, { getUsers })(Wrapper);
}
export default shortUploaded
