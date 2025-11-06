<?php
namespace Bga\Games\TheIsleOfCatsDuel;


class ContextMgr {
    public function __construct(private Game $game) {
    }
    function resolveLastContextIfAction($action) {
        $context = $this->getLastContextToResolve();
        if ($context && $context["action"] == $action) {
            $this->resolveContextLog($context["id"]);
            //$this->dump('*******************Context just resolved', $context);
        } else {
            //$this->dump('*******************Last context not as expected', $action);
        }
    }

    function changeNextStateFromContext() {
        $nextState = "";
        $situation = $this->getLastContextToResolve();
        //$this->dump('******************situation*', $situation);
        if (!$situation) {
            $nextState = "nextPlayer";
        } else {
            switch ($situation["action"]) {
                /*case ACTION_PLAY_TICKET:
                    $nextState = "nextPlayer";
                    $this->dbResolveContextLog($situation["id"]);
                    break;
*/
                default:
                    # code...
                    break;
            }
        }

        $this->game->dump('******************nextState*', $nextState);
        //$this->gamestate->nextState($nextState);
    }

    function insertContextLog($action, $param1 = null, $param2 = null, $param3 = null) {
        $state = $this->game->gamestate->getCurrentMainState()->name;
        $player = $this->game->getMostlyActivePlayerId();
        $values[] = "( '$player', '$state', '$action', '$param1', '$param2', '$param3')";
        $sql = "INSERT INTO context_log (player, state, action, param1, param2, param3)";
        $sql .= " VALUES " . implode(",", $values);
        $this->game->DbQuery($sql);
    }

    function reset() {
        $sql = "delete from context_log";
        $this->game->DbQuery($sql);
    }

    function resolveContextLog($contextId) {
        if (!$contextId) {
            $this->game->error("resolve context log can not be called with an undefined id");
        } else {
            $value = 1;
            $sql = "UPDATE context_log SET resolved = '$value' WHERE id = $contextId";
            $this->game->DbQuery($sql);
        }
    }

    function getLastContextToResolve($count = 1) {
        $positiveCount = $count <= 0 ? 1 : $count;
        $sql = "select * from context_log where resolved = 0 order by id desc limit $positiveCount";
        $res = $this->game->getObjectListFromDB($sql);
        if ($count == 1 && count($res)) return $res[0];
        return $res;
    }

    function getLastResolvedContext() {
        $sql = "select * from context_log where resolved = 1 order by id desc limit 1";
        $res = $this->game->getObjectListFromDB($sql);
        if (count($res)) return $res[0];
        return $res;
    }

    function getAllContextLogs(string|null $action = null) {
        if(!$action) {
            $sql = "select * from context_log order by id desc";
        }else{
            $sql = "select * from context_log where action = '$action' order by id desc";
        }
        $res = $this->game->getObjectListFromDB($sql);
        return $res;
    }
}
